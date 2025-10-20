import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";
import { authRoutes } from "./routes/authen";

const PORT = process.env.PORT || 3000;

const app = new Elysia()
  .use(
    cors({
      origin: true, // In production, specify your frontend domain
      credentials: true,
    })
  )
  .use(cookie())
  .get("/", () => ({
    message: "Elysia + Supabase API",
    version: "1.0.0",
  }))
  .get("/health", () => ({ status: "ok" }))
  .use(authRoutes)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
