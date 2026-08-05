import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Admin client — uses the service role key, bypasses RLS.
 * Only used internally after we've verified the caller's JWT ourselves.
 * Never expose this client or its key to the frontend.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Builds a client scoped to the requesting user's JWT so that RLS policies
 * are enforced by Postgres itself as a second line of defense, in addition
 * to the application-level ownership checks in our repositories.
 */
export function supabaseForUser(accessToken: string): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
