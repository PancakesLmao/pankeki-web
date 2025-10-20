import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";
import { openapi } from "@elysiajs/openapi";
import { authRoutes } from "./routes/auth";
import { projectRoutes } from "./routes/projects";
import { gameRoutes } from "./routes/games";

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
  .use(authRoutes)
  .use(projectRoutes)
  .use(gameRoutes)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

if (isDevelopment) {
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/swagger`
  );
}
