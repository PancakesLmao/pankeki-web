import { Elysia, t } from "elysia";
import { supabase, createSupabaseClient } from "../libs/supabase";

export const authRoutes = new Elysia({ prefix: "/auth" })
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
          cookie.access_token.set({
            value: data.session.access_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: data.session.expires_in,
          });

          cookie.refresh_token.set({
            value: data.session.refresh_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
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
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )

  // Sign out
  .post("/signout", async ({ cookie, set }) => {
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
  })

  // Get current user
  .get("/me", async ({ cookie, set }) => {
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
  })

  // Refresh token
  .post("/refresh", async ({ cookie, set }) => {
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
        cookie.access_token.set({
          value: data.session.access_token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: data.session.expires_in,
        });

        cookie.refresh_token.set({
          value: data.session.refresh_token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      return {
        message: "Token refreshed successfully",
        session: data.session,
      };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  });
