import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { supabase, createSupabaseClient } from "../libs/supabase";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(cookie())
  // Sign in with email and password (admin only)
  .post(
    "/signin",
    async ({ body, set, cookie }) => {
      try {
        const { email, password } = body;
        const supabase = createSupabaseClient();

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set.status = 401;
          return { error: error.message };
        }

        // Set cookies for session management
        if (data.session) {
          cookie.access_token.value = data.session.access_token;
          cookie.access_token.httpOnly = true;
          cookie.access_token.secure = process.env.NODE_ENV === "production";
          cookie.access_token.sameSite = "strict";
          cookie.access_token.maxAge = data.session.expires_in;

          cookie.refresh_token.value = data.session.refresh_token;
          cookie.refresh_token.httpOnly = true;
          cookie.refresh_token.secure = process.env.NODE_ENV === "production";
          cookie.refresh_token.sameSite = "strict";
          cookie.refresh_token.maxAge = 60 * 60 * 24 * 7; // 7 days
        }

        return {
          message: "Signed in successfully",
          user: data.user,
          session: data.session,
        };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        email: t.String({
          description: "Admin email address",
          example: "admin@example.com",
          default: "admin@example.com",
        }),
        password: t.String({
          description: "Admin password",
          example: "your-password",
          default: "secure-password-123",
        }),
      }),
      response: {
        200: t.Object({
          message: t.String(),
          user: t.Any(),
          session: t.Any(),
        }),
        401: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Auth"],
        summary: "Sign in",
        description:
          "Authenticate admin user and create session. Returns user data and sets HTTP-only cookies for session management.",
      },
    }
  )

  // Sign out
  .post(
    "/signout",
    async ({ cookie, set }) => {
      try {
        const accessToken = cookie.access_token.value;

        if (accessToken) {
          const supabase = createSupabaseClient(accessToken);
          await supabase.auth.signOut();
        }

        // Clear cookies
        cookie.access_token.remove();
        cookie.refresh_token.remove();

        return { message: "Signed out successfully" };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      response: {
        200: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Auth"],
        summary: "Sign out",
        description:
          "Clear user session and cookies. Removes access and refresh tokens.",
      },
    }
  )

  // Get current user
  .get(
    "/me",
    async ({ cookie, set }) => {
      try {
        const accessToken = cookie.access_token.value;

        if (!accessToken) {
          set.status = 401;
          return { error: "Not authenticated" };
        }

        const supabase = createSupabaseClient(accessToken);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          set.status = 401;
          return { error: error.message };
        }

        return { user };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      response: {
        200: t.Object({
          user: t.Any(),
        }),
        401: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Auth"],
        summary: "Get current user",
        description:
          "Retrieve authenticated user information using access token from cookies",
      },
    }
  )

  // Refresh token
  .post(
    "/refresh",
    async ({ cookie, set }) => {
      try {
        const refreshToken = cookie.refresh_token.value;

        if (!refreshToken) {
          set.status = 401;
          return { error: "No refresh token found" };
        }

        const supabase = createSupabaseClient();
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (error) {
          set.status = 401;
          return { error: error.message };
        }

        if (data.session) {
          cookie.access_token.value = data.session.access_token;
          cookie.access_token.httpOnly = true;
          cookie.access_token.secure = process.env.NODE_ENV === "production";
          cookie.access_token.sameSite = "strict";
          cookie.access_token.maxAge = data.session.expires_in;

          cookie.refresh_token.value = data.session.refresh_token;
          cookie.refresh_token.httpOnly = true;
          cookie.refresh_token.secure = process.env.NODE_ENV === "production";
          cookie.refresh_token.sameSite = "strict";
          cookie.refresh_token.maxAge = 60 * 60 * 24 * 7;
        }

        return {
          message: "Token refreshed successfully",
          session: data.session,
        };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      response: {
        200: t.Object({
          message: t.String(),
          session: t.Any(),
        }),
        401: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Auth"],
        summary: "Refresh token",
        description:
          "Refresh access token using refresh token from cookies. Sets new access and refresh tokens.",
      },
    }
  );
