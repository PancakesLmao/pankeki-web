import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";
import { openapi } from "@elysiajs/openapi";
import { supabase } from "./libs/supabase";
import { authRoutes } from "./routes/auth";
import { projectRoutes } from "./routes/projects";
import { gameRoutes } from "./routes/games";
import { enumRoutes } from "./routes/enums";

const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== "production";

let app = new Elysia()
  .use(
    cors({
      origin: true, // In production, specify your frontend domain
      credentials: true,
    })
  )
  .use(cookie());

// Add OpenAPI documentation only in development
if (isDevelopment) {
  app = app.use(
    openapi({
      documentation: {
        info: {
          title: "Portfolio API",
          description: "API for managing portfolio projects and authentication",
          version: "1.0.0",
        },
        tags: [
          { name: "Health", description: "Health check endpoints" },
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Projects", description: "Project management endpoints" },
          { name: "Games", description: "Game management endpoints" },
          { name: "Enums", description: "Enum reference endpoints" },
        ],
      },
      path: "/swagger",
    })
  );
}

app = app
  .get("/", () => ({
    message: "Elysia + Supabase API",
    version: "1.0.0",
  }))
  .get("/health", () => ({ status: "ok" }), {
    detail: {
      tags: ["Health"],
      summary: "Health check",
      description: "Returns server health status",
    },
  })
  .get(
    "/debug/tables",
    async () => {
      try {
        const { data, error } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public");

        if (error) {
          return { error: error.message, code: (error as any).code };
        }

        return { tables: data?.map((t: any) => t.table_name) || [] };
      } catch (err: any) {
        return { error: err.message };
      }
    },
    {
      detail: {
        tags: ["Debug"],
        description: "List all tables in the database",
      },
    }
  )
  .use(authRoutes)
  .use(projectRoutes)
  .use(gameRoutes)
  .use(enumRoutes)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

if (isDevelopment) {
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/swagger`
  );
}
