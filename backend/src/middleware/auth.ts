import { supabase, createSupabaseClient } from "../libs/supabase";

/**
 * Authentication middleware to verify and refresh tokens
 *
 * @description
 * - Validates access token using supabase.auth.getUser()
 * - Automatically refreshes expired tokens using refresh_token
 * - Updates cookies with new tokens after refresh
 * - Returns authenticated Supabase client for database operations
 *
 * @throws Error with 401 status if authentication fails
 * @returns Object containing authenticated Supabase client and user data
 */
export const requireAuth = async ({ cookie, set }: any) => {
  const accessToken = cookie.access_token?.value;
  const refreshToken = cookie.refresh_token?.value;

  if (!accessToken) {
    set.status = 401;
    throw new Error("Unauthorized - No access token");
  }

  // Create Supabase client with the access token
  const supabaseClient = createSupabaseClient(accessToken);

  // Verify the access token by getting the user
  const { data: userData, error: userError } =
    await supabaseClient.auth.getUser();

  // If token is valid, return the authenticated client
  if (!userError && userData.user) {
    return { supabase: supabaseClient, user: userData.user };
  }

  // If access token is invalid/expired, try to refresh
  if (refreshToken) {
    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

    if (!refreshError && refreshData.session) {
      // Update cookies with new tokens
      cookie.access_token.value = refreshData.session.access_token;
      cookie.access_token.httpOnly = true;
      cookie.access_token.secure = process.env.NODE_ENV === "production";
      cookie.access_token.sameSite = "strict";
      cookie.access_token.maxAge = refreshData.session.expires_in;

      cookie.refresh_token.value = refreshData.session.refresh_token;
      cookie.refresh_token.httpOnly = true;
      cookie.refresh_token.secure = process.env.NODE_ENV === "production";
      cookie.refresh_token.sameSite = "strict";
      cookie.refresh_token.maxAge = 60 * 60 * 24 * 7; // 7 days

      // Return new authenticated client
      const newClient = createSupabaseClient(refreshData.session.access_token);
      return { supabase: newClient, user: refreshData.user };
    }
  }

  // If refresh failed, unauthorized
  set.status = 401;
  throw new Error("Unauthorized - Invalid or expired token");
};
