import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";
import { openapi } from "@elysiajs/openapi";
import { supabase, checkDatabaseConnection } from "./libs/supabase";
import { authRoutes } from "./routes/auth";
import { projectRoutes } from "./routes/projects";
import { gameRoutes } from "./routes/games";
import { enumRoutes } from "./routes/enums";
import { experienceRoutes } from "./routes/experiences";

const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== "production";
const DOMAIN = process.env.DOMAIN || "localhost";
const FRONTEND_PORT = process.env.FRONTEND_PORT || "5173";

// Request logging middleware
const logRequest = (context: any) => {
  const method = context.request.method;
  const url = new URL(context.request.url);
  const path = url.pathname + url.search;
  const start = Date.now();

  return {
    method,
    path,
    start,
  };
};

const logResponse = (context: any, requestInfo: any) => {
  const duration = Date.now() - requestInfo.start;
  const status = context.set.status || 200;

  // Color codes for terminal output
  const statusColor =
    status >= 500
      ? "\x1b[31m" // Red for 5xx
      : status >= 400
        ? "\x1b[33m" // Yellow for 4xx
        : status >= 300
          ? "\x1b[36m" // Cyan for 3xx
          : status >= 200
            ? "\x1b[32m" // Green for 2xx
            : "\x1b[37m"; // White for other

  const resetColor = "\x1b[0m";

  console.log(
    `${requestInfo.method.padEnd(6)} ${requestInfo.path.padEnd(40)} ${statusColor}${status}${resetColor} ${duration}ms`,
  );
};

const getFrontendUrl = (): string => {
  if (isDevelopment) {
    return `http://${DOMAIN}:${FRONTEND_PORT}`;
  }
  if (!DOMAIN || DOMAIN === "localhost") {
    throw new Error("DOMAIN environment variable must be set in production");
  }
  return `https://${DOMAIN}`;
};

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  getFrontendUrl(),
] as string[];

// Cookie configuration for cross-domain authentication
// - COOKIE_SAMESITE: Controls whether cookies are sent across origins
//   * "strict": Same-site requests only (default for same-domain deployments)
//   * "lax": Sent on top-level navigation and same-site requests (recommended for cross-domain)
//   * "none": Sent on all requests (requires secure: true and HTTPS)
// - COOKIE_SECURE: Only send cookies over HTTPS (required for production)
const cookieSameSite = (process.env.COOKIE_SAMESITE || "lax") as
  | "strict"
  | "lax"
  | "none";
const cookieSecure =
  process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";

// Cookie configuration for cross-domain authentication
// - COOKIE_SAMESITE: Controls whether cookies are sent across origins
//   * "strict": Same-site requests only (default for same-domain deployments)
//   * "lax": Sent on top-level navigation and same-site requests (recommended for cross-domain)
//   * "none": Sent on all requests (requires secure: true and HTTPS)
// - COOKIE_SECURE: Only send cookies over HTTPS (required for production)
const cookieSameSite = (process.env.COOKIE_SAMESITE || "lax") as
  | "strict"
  | "lax"
  | "none";
const cookieSecure =
  process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";

// Cookie configuration for cross-domain authentication
// - COOKIE_SAMESITE: Controls whether cookies are sent across origins
//   * "strict": Same-site requests only (default for same-domain deployments)
//   * "lax": Sent on top-level navigation and same-site requests (recommended for cross-domain)
//   * "none": Sent on all requests (requires secure: true and HTTPS)
// - COOKIE_SECURE: Only send cookies over HTTPS (required for production)
const cookieSameSite = (process.env.COOKIE_SAMESITE || "lax") as
  | "strict"
  | "lax"
  | "none";
const cookieSecure =
  process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";

let app = new Elysia()
  .use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      allowedHeaders: ["Content-Type"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  )
  .use(cookie())
  .onBeforeHandle((context) => {
    const requestInfo = logRequest(context);
    (context as any).__requestInfo = requestInfo;
  })
  .onAfterHandle((context) => {
    const requestInfo = (context as any).__requestInfo;
    if (requestInfo) {
      logResponse(context, requestInfo);
    }
  })
  .onError(({ code, error, set }) => {
    // Don't log 404 errors (common for missing resources like favicon)
    if (code !== "NOT_FOUND") {
      console.error("❌ Global error handler:", code, error);
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found" };
    }

    set.status = 500;
    return { error: error.message || "Internal server error" };
  });

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
          { name: "Experiences", description: "Work experience endpoints" },
        ],
      },
      path: "/swagger",
    }),
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
    },
  )
  .use(authRoutes)
  .use(projectRoutes)
  .use(gameRoutes)
  .use(enumRoutes)
  .use(experienceRoutes)
  .listen(PORT);

const reset = "\x1b[0m";
const bold = "\x1b[1m";
const green = "\x1b[32m";
const red = "\x1b[31m";
const cyan = "\x1b[36m";
const gray = "\x1b[90m";

async function logStartup() {
  const host = app.server?.hostname;
  const port = app.server?.port;

  console.log("");
  console.log(`${bold}  Portfolio API${reset}`);
  console.log(`${gray}  ─────────────────────────────────${reset}`);
  console.log(
    `${green}  ✓${reset} Server     ${bold}http://${host}:${port}${reset}`,
  );

  try {
    await checkDatabaseConnection();
    console.log(`${green}  ✓${reset} Database   connected`);
  } catch (err: any) {
    console.log(
      `${red}  ✗${reset} Database   ${red}connection failed — ${err.message}${reset}`,
    );
  }

  console.log(
    `${green}  ✓${reset} Mode       ${isDevelopment ? "development" : "production"}`,
  );
  console.log(`${green}  ✓${reset} CORS       ${getFrontendUrl()}`);

  if (isDevelopment) {
    console.log(
      `${cyan}  ↗${reset} Swagger    http://localhost:${port}/swagger`,
    );
  }

  console.log(`${gray}  ─────────────────────────────────${reset}`);
  console.log("");
}

logStartup();
