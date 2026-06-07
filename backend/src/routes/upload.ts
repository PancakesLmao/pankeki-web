import { Elysia, t } from "elysia";
import { requireAuth } from "../middleware/auth";
import {
  createSupabaseClient,
  createSupabaseServiceClient,
} from "../libs/supabase";

export const uploadRoutes = new Elysia({ prefix: "/api" }).post(
  "/upload",
  async ({ body, cookie, set }) => {
    try {
      await requireAuth({ cookie, set });

      const accessToken = cookie.access_token?.value;
      if (!accessToken) {
        set.status = 401;
        return { success: false, error: "Unauthorized - No access token" };
      }

      const { file, entityType, imageType, entityId, oldImagePath } = body;
      const bucketName = "portfolio-bucket";
      const maxFileSize = 8 * 1024 * 1024;
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (file.size > maxFileSize) {
        set.status = 400;
        return { success: false, error: "File size exceeds 8MB limit" };
      }

      if (!allowedTypes.includes(file.type)) {
        set.status = 400;
        return { success: false, error: "Invalid file type" };
      }

      const safeName =
        file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .toLowerCase() || "upload";
      const extMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
      };
      const extFromName = file.name.split(".").pop();
      const ext =
        extFromName && extFromName !== file.name
          ? extFromName
          : extMap[file.type] || "bin";
      const timestamp = Date.now();
      const storagePath = `${entityType}/${timestamp}-${safeName}-${imageType}.${ext}`;

      const storageClient = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createSupabaseServiceClient()
        : createSupabaseClient(accessToken);

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await storageClient.storage
        .from(bucketName)
        .upload(storagePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        set.status = 500;
        return { success: false, error: uploadError.message };
      }

      const { data: publicData } = storageClient.storage
        .from(bucketName)
        .getPublicUrl(storagePath);
      const publicUrl = publicData.publicUrl;

      if (entityId) {
        const fieldName =
          entityType === "projects"
            ? "project_img"
            : entityType === "games"
              ? imageType === "icon"
                ? "icon_img"
                : "cover_img"
              : entityType === "certifications"
                ? imageType === "image"
                  ? "image_url"
                  : "icon"
              : "logo";

        const dbClient = process.env.SUPABASE_SERVICE_ROLE_KEY
          ? createSupabaseServiceClient()
          : createSupabaseClient(accessToken);
        const { error: updateError } = await dbClient
          .from(entityType)
          .update({ [fieldName]: publicUrl })
          .eq("id", entityId);

        if (updateError) {
          await storageClient.storage.from(bucketName).remove([storagePath]);
          set.status = 500;
          return { success: false, error: updateError.message };
        }
      }

      if (oldImagePath) {
        const baseUrl = process.env.SUPABASE_URL;
        const publicPrefix = baseUrl
          ? `${baseUrl}/storage/v1/object/public/${bucketName}/`
          : "";
        const deletePath = oldImagePath.startsWith("http")
          ? oldImagePath.replace(publicPrefix, "")
          : oldImagePath;
        if (deletePath && !deletePath.startsWith("http")) {
          await storageClient.storage.from(bucketName).remove([deletePath]);
        }
      }

      return { success: true, path: publicUrl };
    } catch (error: any) {
      console.error("Upload error:", error);
      set.status = 500;
      return {
        success: false,
        error: error.message || "Internal server error",
      };
    }
  },
  {
    body: t.Object({
      file: t.File({
        description: "Image file to upload",
      }),
      entityType: t.Union([
        t.Literal("projects"),
        t.Literal("games"),
        t.Literal("experiences"),
        t.Literal("certifications"),
      ]),
      imageType: t.Union([
        t.Literal("project"),
        t.Literal("cover"),
        t.Literal("icon"),
        t.Literal("logo"),
        t.Literal("image"),
      ]),
      entityId: t.Optional(t.String()),
      oldImagePath: t.Optional(t.String()),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        path: t.Optional(t.String()),
        message: t.Optional(t.String()),
      }),
      400: t.Object({
        success: t.Boolean(),
        error: t.String(),
      }),
      500: t.Object({
        success: t.Boolean(),
        error: t.String(),
      }),
    },
    detail: {
      tags: ["Upload"],
      summary: "Upload image",
      description:
        "Upload image file to Supabase storage. Supports JPEG, PNG, WebP, and GIF formats. Maximum file size is 10MB. For image replacements, provide oldImagePath to delete the previous image.",
    },
  },
);
