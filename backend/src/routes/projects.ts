import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { prisma } from "../libs/prisma";
import { requireAuth } from "../middleware/auth";

// Helper function to serialize BigInt to string and convert status to URL-friendly format
const serializeProject = (project: any) => ({
  ...project,
  id: project.id.toString(),
  status: reverseStatusMap[project.status] || project.status,
});

// Mapping between URL-friendly status and database enum
const statusMap: Record<string, string> = {
  "completed-and-published": "Completed_and_Published",
  ongoing: "Ongoing",
  deprecated: "Deprecated",
  "completed-and-documenting": "Completed_and_Documenting",
  upcoming: "Upcoming",
  "under-maintenance": "Under_Maintenance",
};

// Reverse mapping for responses
const reverseStatusMap: Record<string, string> = {
  Completed_and_Published: "completed-and-published",
  Ongoing: "ongoing",
  Deprecated: "deprecated",
  Completed_and_Documenting: "completed-and-documenting",
  Upcoming: "upcoming",
  Under_Maintenance: "under-maintenance",
};

export const projectRoutes = new Elysia({ prefix: "/api/projects" })
  .use(cookie())
  // Get all projects (public access)
  .get(
    "/",
    async ({ query, set }) => {
      try {
        // Convert URL-friendly status to database enum
        const dbStatus = query.status ? statusMap[query.status] : undefined;

        const projects = await prisma.projects.findMany({
          where: dbStatus ? { status: dbStatus as any } : {},
          orderBy: { created_at: "desc" },
        });

        return { projects: projects.map(serializeProject) };
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
              t.Literal("completed-and-published"),
              t.Literal("ongoing"),
              t.Literal("deprecated"),
              t.Literal("completed-and-documenting"),
              t.Literal("upcoming"),
              t.Literal("under-maintenance"),
            ],
            {
              description:
                "Filter projects by status. Use lowercase with hyphens. Omit to fetch all projects.",
            }
          )
        ),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Get all projects",
        description:
          "Retrieve all portfolio projects (public access). Can be filtered by status using URL-friendly format (e.g., 'completed-and-published'). Omit status parameter to get all projects.",
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

        return { project: serializeProject(project) };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({
          description: "Project ID",
          default: 1,
        }),
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

        // Convert URL-friendly status to database enum
        const dbStatus = statusMap[body.status] || body.status;

        const project = await prisma.projects.create({
          data: {
            title: body.title,
            description: body.description,
            tags: body.tags,
            link: body.link,
            project_img: body.project_img,
            status: dbStatus as any,
            time_range: body.time_range,
            created_by: user!.id,
          },
        });

        return {
          message: "Project created successfully",
          project: serializeProject(project),
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
          default: "Weather Platform",
        }),
        description: t.Optional(
          t.String({
            description: "Project description",
            default:
              "Centralized IoT platform that build specifically for weather stations",
          })
        ),
        tags: t.Array(t.String(), {
          description: "Array of technology tags",
          default: ["Nextjs", "Typescript", "Tailwind", "PostgreSQL"],
        }),
        link: t.Optional(
          t.String({
            description: "Project link (GitHub, live demo, etc.)",
            default: "https://github.com/username/weather-platform",
          })
        ),
        project_img: t.Optional(
          t.String({
            description: "Project image URL",
            default: "https://placehold.co/600x400/png",
          })
        ),
        time_range: t.Optional(
          t.String({
            description:
              "Development time range (e.g., 'February 2025 - March 2025')",
            default: "January 2025 - February 2025",
          })
        ),
        status: t.Union(
          [
            t.Literal("completed-and-published"),
            t.Literal("ongoing"),
            t.Literal("deprecated"),
            t.Literal("completed-and-documenting"),
            t.Literal("upcoming"),
            t.Literal("under-maintenance"),
          ],
          {
            description:
              "Project status (required). Use lowercase with hyphens.",
            default: "ongoing",
          }
        ),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Create project",
        description:
          "Create a new project (admin only). The created_by field is automatically set from the authenticated user. Use URL-friendly status format (e.g., 'ongoing', 'completed-and-published').",
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
        if (body.time_range !== undefined)
          updateData.time_range = body.time_range;
        if (body.status !== undefined) {
          // Convert URL-friendly status to database enum
          updateData.status = statusMap[body.status] || body.status;
        }

        const project = await prisma.projects.update({
          where: { id: BigInt(params.id) },
          data: updateData,
        });

        return {
          message: "Project updated successfully",
          project: serializeProject(project),
        };
      } catch (error: any) {
        set.status = error.message.includes("Unauthorized") ? 401 : 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({
          description: "Project ID to update",
          default: 1,
        }),
      }),
      body: t.Partial(
        t.Object({
          title: t.String({
            description: "Project title",
            default: "Updated Weather Platform",
          }),
          description: t.String({
            description: "Project description",
            default: "Enhanced IoT platform with real-time analytics",
          }),
          tags: t.Array(t.String(), {
            description: "Array of technology tags",
            default: [
              "Nextjs",
              "Typescript",
              "Tailwind",
              "PostgreSQL",
              "Redis",
            ],
          }),
          link: t.String({
            description: "Project link",
            default: "https://github.com/username/weather-platform-v2",
          }),
          project_img: t.String({
            description: "Project image URL",
            default: "https://placehold.co/600x400/png",
          }),
          time_range: t.String({
            description:
              "Development time range (e.g., 'February 2025 - March 2025')",
            default: "January 2025 - March 2025",
          }),
          status: t.Union(
            [
              t.Literal("completed-and-published"),
              t.Literal("ongoing"),
              t.Literal("deprecated"),
              t.Literal("completed-and-documenting"),
              t.Literal("upcoming"),
              t.Literal("under-maintenance"),
            ],
            {
              description: "Project status. Use lowercase with hyphens.",
              default: "ongoing",
            }
          ),
        })
      ),
      detail: {
        tags: ["Projects"],
        summary: "Update project",
        description:
          "Update an existing project (admin only). All fields are optional. Use URL-friendly status format (e.g., 'ongoing', 'completed-and-published').",
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
        id: t.Numeric({
          description: "Project ID to delete",
          default: 1,
        }),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Delete project",
        description: "Delete a project (admin only)",
      },
    }
  );
