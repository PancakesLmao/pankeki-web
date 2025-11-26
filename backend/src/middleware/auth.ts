import { supabase, createSupabaseClient } from "../libs/supabase";

export const requireAuth = async ({ cookie, set }: any) => {
  const accessToken = cookie.access_token?.value;

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

  // Token is invalid or expired
  set.status = 401;
  throw new Error("Unauthorized - Invalid or expired token");
};
