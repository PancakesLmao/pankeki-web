import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { prisma } from "../libs/prisma";
import { requireAuth } from "../middleware/auth";

export const projectRoutes = new Elysia({ prefix: "/projects" })
  .use(cookie())
  // Get all projects (public access)
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const projects = await prisma.projects.findMany({
          where: query.status ? { status: query.status as any } : undefined,
          orderBy: { created_at: "desc" },
        });

        return { projects };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      query: t.Object({
        status: t.Optional(
          t.Union(
            [
              t.Literal("Completed_and_Published"),
              t.Literal("Ongoing"),
              t.Literal("Deprecated"),
              t.Literal("Completed_and_Documenting"),
              t.Literal("Upcoming"),
              t.Literal("Under_Maintenance"),
            ],
            {
              description:
                "Filter projects by status. Use underscores, not spaces.",
              example: "Ongoing",
            }
          )
        ),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Get all projects",
        description:
          "Retrieve all portfolio projects (public access). Can be filtered by status.",
      },
    }
  )

  // Get a single project by ID (public access)
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const project = await prisma.projects.findUnique({
          where: { id: BigInt(params.id) },
        });

        if (!project) {
          set.status = 404;
          return { error: "Project not found" };
        }

        return { project };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Get project by ID",
        description: "Retrieve a specific project by its ID (public access)",
      },
    }
  )

  // Create a new project (admin only)
  .post(
    "/",
    async ({ body, cookie, set }) => {
      try {
        const { user } = await requireAuth({ cookie, set });

        const project = await prisma.projects.create({
          data: {
            title: body.title,
            description: body.description,
            tags: body.tags,
            link: body.link,
            project_img: body.project_img,
            status: body.status,
            created_by: user!.id,
          },
        });

        return {
          message: "Project created successfully",
          project,
        };
      } catch (error: any) {
        set.status = error.message.includes("Unauthorized") ? 401 : 500;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        title: t.String({
          description: "Project title",
          example: "Weather Platform",
        }),
        description: t.Optional(
          t.String({
            description: "Project description",
            example:
              "Centralized IoT platform that build specifically for weather stations",
          })
        ),
        tags: t.Array(t.String(), {
          description: "Array of technology tags",
          example: ["Nextjs", "Typescript", "Tailwind"],
        }),
        link: t.Optional(
          t.String({
            description: "Project link (GitHub, live demo, etc.)",
            example: "https://github.com/username/project",
          })
        ),
        project_img: t.Optional(
          t.String({
            description: "Project image URL",
            example: "https://example.com/image.jpg",
          })
        ),
        status: t.Union(
          [
            t.Literal("Completed_and_Published"),
            t.Literal("Ongoing"),
            t.Literal("Deprecated"),
            t.Literal("Completed_and_Documenting"),
            t.Literal("Upcoming"),
            t.Literal("Under_Maintenance"),
          ],
          {
            description:
              "Project status (required). Use underscores, not spaces.",
            example: "Ongoing",
          }
        ),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Create project",
        description:
          "Create a new project (admin only). The created_by field is automatically set from the authenticated user.",
      },
    }
  )

  // Update a project (admin only)
  .put(
    "/:id",
    async ({ params, body, cookie, set }) => {
      try {
        await requireAuth({ cookie, set });

        const updateData: any = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined)
          updateData.description = body.description;
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.link !== undefined) updateData.link = body.link;
        if (body.project_img !== undefined)
          updateData.project_img = body.project_img;
        if (body.status !== undefined) updateData.status = body.status;

        const project = await prisma.projects.update({
          where: { id: BigInt(params.id) },
          data: updateData,
        });

        return {
          message: "Project updated successfully",
          project,
        };
      } catch (error: any) {
        set.status = error.message.includes("Unauthorized") ? 401 : 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Partial(
        t.Object({
          title: t.String({
            description: "Project title",
          }),
          description: t.String({
            description: "Project description",
          }),
          tags: t.Array(t.String(), {
            description: "Array of technology tags",
          }),
          link: t.String({
            description: "Project link",
          }),
          project_img: t.String({
            description: "Project image URL",
          }),
          status: t.Union(
            [
              t.Literal("Completed_and_Published"),
              t.Literal("Ongoing"),
              t.Literal("Deprecated"),
              t.Literal("Completed_and_Documenting"),
              t.Literal("Upcoming"),
              t.Literal("Under_Maintenance"),
            ],
            {
              description: "Project status. Use underscores, not spaces.",
            }
          ),
        })
      ),
      detail: {
        tags: ["Projects"],
        summary: "Update project",
        description:
          "Update an existing project (admin only). All fields are optional.",
      },
    }
  )

  // Delete a project (admin only)
  .delete(
    "/:id",
    async ({ params, cookie, set }) => {
      try {
        await requireAuth({ cookie, set });

        await prisma.projects.delete({
          where: { id: BigInt(params.id) },
        });

        return { message: "Project deleted successfully" };
      } catch (error: any) {
        set.status = error.message.includes("Unauthorized") ? 401 : 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Delete project",
        description: "Delete a project (admin only)",
      },
    }
  );
