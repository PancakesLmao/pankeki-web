import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import {
  getCertifications,
  getCertification,
  createCertification,
  updateCertification,
  deleteCertification,
} from "../libs/db";
import { requireAuth } from "../middleware/auth";
import { getMultipleSignedUrls } from "../libs/storage";
import { createSupabaseServiceClient } from "../libs/supabase";

const BUCKET_NAME = "portfolio-bucket";

function toStoragePath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("http")) return value;

  try {
    const url = new URL(value);
    const prefix = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const index = url.pathname.indexOf(prefix);
    if (index >= 0) {
      return url.pathname.slice(index + prefix.length);
    }
  } catch {
    // Ignore invalid URLs
  }

  const fallbackMatch = value.match(
    new RegExp(`/storage/v1/object/public/${BUCKET_NAME}/(.+)$`),
  );
  return fallbackMatch ? fallbackMatch[1] : null;
}

export const certificationRoutes = new Elysia({ prefix: "/api/certifications" })
  .use(cookie())

  // Get all certifications (public)
  .get(
    "/",
    async ({ set }) => {
      try {
        const certifications = await getCertifications();

        // Generate signed URLs for icon and image_url fields
        const pathsToSign: string[] = [];
        certifications.forEach((cert: any) => {
          if (cert.icon) pathsToSign.push(cert.icon);
          if (cert.image_url) pathsToSign.push(cert.image_url);
        });

        const signedUrls = await getMultipleSignedUrls(pathsToSign);

        const certificationsWithUrls = certifications.map((cert: any) => {
          return {
            ...cert,
            icon: cert.icon && signedUrls[cert.icon] ? signedUrls[cert.icon] : cert.icon,
            image_url: cert.image_url && signedUrls[cert.image_url] ? signedUrls[cert.image_url] : cert.image_url,
          };
        });

        return { certifications: certificationsWithUrls };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      detail: {
        tags: ["Certifications"],
        summary: "Get all certifications",
        description: "Retrieve all certifications (public access)",
      },
    },
  )

  // Get single certification (public)
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const cert = await getCertification(BigInt(params.id));
        if (!cert) {
          set.status = 404;
          return { error: "Certification not found" };
        }

        const pathsToSign: string[] = [];
        if (cert.icon) pathsToSign.push(cert.icon);
        if (cert.image_url) pathsToSign.push(cert.image_url);

        if (pathsToSign.length > 0) {
          const signedUrls = await getMultipleSignedUrls(pathsToSign);
          if (cert.icon && signedUrls[cert.icon]) cert.icon = signedUrls[cert.icon];
          if (cert.image_url && signedUrls[cert.image_url]) cert.image_url = signedUrls[cert.image_url];
        }

        return { certification: cert };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Certification ID" }),
      }),
      detail: {
        tags: ["Certifications"],
        summary: "Get certification by ID",
      },
    },
  )

  // Add certification (admin only)
  .post(
    "/",
    async ({ body, cookie, set }) => {
      try {
        const { supabase: authClient, user } = await requireAuth({ cookie, set });

        const cert = await createCertification(
          {
            title: body.title,
            issuer: body.issuer,
            date: body.date,
            icon: body.icon,
            image_url: body.image_url,
            url: body.url,
            created_by: user!.id,
          },
          authClient,
        );

        return { message: "Certification created successfully", certification: cert };
      } catch (error: any) {
        set.status = error.message.includes("Unauthorized") ? 401 : 500;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        title: t.String(),
        issuer: t.String(),
        date: t.Optional(t.String()),
        icon: t.Optional(t.String({ description: "Icon URL" })),
        image_url: t.Optional(t.String({ description: "Image URL" })),
        url: t.Optional(t.String({ description: "Verification URL" })),
      }),
      detail: {
        tags: ["Certifications"],
        summary: "Add certification",
      },
    },
  )

  // Update certification (admin only)
  .put(
    "/:id",
    async ({ params, body, cookie, set }) => {
      try {
        const { supabase: authClient } = await requireAuth({ cookie, set });

        const cert = await updateCertification(BigInt(params.id), body, authClient);
        return { message: "Certification updated successfully", certification: cert };
      } catch (error: any) {
        set.status = error.message.includes("Unauthorized") ? 401 : 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Certification ID" }),
      }),
      body: t.Partial(
        t.Object({
          title: t.String(),
          issuer: t.String(),
          date: t.Optional(t.String()),
          icon: t.Optional(t.String({ description: "Icon URL" })),
          image_url: t.Optional(t.String({ description: "Image URL" })),
          url: t.Optional(t.String({ description: "Verification URL" })),
        }),
      ),
      detail: {
        tags: ["Certifications"],
        summary: "Update certification",
      },
    },
  )

  // Delete certification (admin only)
  .delete(
    "/:id",
    async ({ params, cookie, set }) => {
      try {
        const { supabase: authClient } = await requireAuth({ cookie, set });
        const storageClient = process.env.SUPABASE_SERVICE_ROLE_KEY
          ? createSupabaseServiceClient()
          : authClient;

        const existing = await getCertification(BigInt(params.id), storageClient);
        if (existing) {
          const deletePaths: string[] = [];
          const iconPath = toStoragePath(existing.icon);
          if (iconPath) deletePaths.push(iconPath);
          const imagePath = toStoragePath(existing.image_url);
          if (imagePath) deletePaths.push(imagePath);

          if (deletePaths.length > 0) {
            const { error } = await storageClient.storage
              .from(BUCKET_NAME)
              .remove(deletePaths);
            if (error) console.warn("Failed to delete certification files:", error.message);
          }
        }

        await deleteCertification(BigInt(params.id), authClient);
        return { message: "Certification deleted successfully" };
      } catch (error: any) {
        set.status = error.message.includes("Unauthorized") ? 401 : 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Certification ID" }),
      }),
      detail: {
        tags: ["Certifications"],
        summary: "Delete certification",
      },
    },
  );
