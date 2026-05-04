import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import {
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from "../libs/db";
import { requireAuth } from "../middleware/auth";

export const experienceRoutes = new Elysia({ prefix: "/api/experiences" })
  .use(cookie())

  // Get all experiences (public)
  .get(
    "/",
    async ({ set }) => {
      try {
        const experiences = await getExperiences();
        return { experiences };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      detail: {
        tags: ["Experiences"],
        summary: "Get all experiences",
        description: "Retrieve all work experiences (public access)",
      },
    },
  )

  // Get single experience (public)
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const experience = await getExperience(BigInt(params.id));
        if (!experience) {
          set.status = 404;
          return { error: "Experience not found" };
        }
        return { experience };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Experience ID" }),
      }),
      detail: {
        tags: ["Experiences"],
        summary: "Get experience by ID",
        description: "Retrieve a specific experience by ID (public access)",
      },
    },
  )

  // Add experience (admin only)
  .post(
    "/",
    async ({ body, cookie, set }) => {
      try {
        const { user, supabase: authClient } = await requireAuth({
          cookie,
          set,
        });

        const experience = await createExperience(
          {
            title: body.title,
            company: body.company,
            location: body.location,
            description: body.description,
            date: body.date,
            logo: body.logo,
            created_by: user!.id,
          },
          authClient,
        );

        return { message: "Experience created successfully", experience };
      } catch (error: any) {
        set.status = error.message.includes("Unauthorized") ? 401 : 500;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        title: t.String({
          description: "Job title",
          default: "Software Engineer",
        }),
        company: t.String({
          description: "Company name",
          default: "Acme Corp",
        }),
        location: t.Optional(
          t.String({ description: "Location", default: "HCM, Vietnam" }),
        ),
        description: t.String({
          description: "Role description",
          default: "Worked on...",
        }),
        date: t.String({
          description: "Date range",
          default: "January 2025 - Present",
        }),
        logo: t.Optional(
          t.String({ description: "Logo URL or storage path", default: "" }),
        ),
      }),
      detail: {
        tags: ["Experiences"],
        summary: "Add experience",
        description: "Add a new work experience entry (admin only)",
      },
    },
  )

  // Update experience (admin only)
  .put(
    "/:id",
    async ({ params, body, cookie, set }) => {
      try {
        const { supabase: authClient } = await requireAuth({ cookie, set });

        const experience = await updateExperience(
          BigInt(params.id),
          body,
          authClient,
        );
        return { message: "Experience updated successfully", experience };
      } catch (error: any) {
        set.status = error.message.includes("Unauthorized") ? 401 : 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Experience ID to update" }),
      }),
      body: t.Partial(
        t.Object({
          title: t.String({ description: "Job title" }),
          company: t.String({ description: "Company name" }),
          location: t.Optional(t.String({ description: "Location" })),
          description: t.String({ description: "Role description" }),
          date: t.String({ description: "Date range" }),
          logo: t.Optional(
            t.String({ description: "Logo URL or storage path" }),
          ),
        }),
      ),
      detail: {
        tags: ["Experiences"],
        summary: "Update experience",
        description: "Update an existing experience entry (admin only)",
      },
    },
  )

  // Delete experience (admin only)
  .delete(
    "/:id",
    async ({ params, cookie, set }) => {
      try {
        const { supabase: authClient } = await requireAuth({ cookie, set });

        await deleteExperience(BigInt(params.id), authClient);
        return { message: "Experience deleted successfully" };
      } catch (error: any) {
        set.status = error.message.includes("Unauthorized") ? 401 : 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Experience ID to delete" }),
      }),
      detail: {
        tags: ["Experiences"],
        summary: "Delete experience",
        description: "Delete a work experience entry (admin only)",
      },
    },
  );
