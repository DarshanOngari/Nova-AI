import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

const supabaseKey = env.supabaseAnonKey;
const serviceKey = env.supabaseServiceRoleKey || env.supabaseAnonKey;

/**
 * Supabase client using the ANON key.
 * Respects Row Level Security — safe for verifying JWTs and public queries.
 */
export const supabaseAnon = createClient(env.supabaseUrl, supabaseKey);

/**
 * Supabase client using the SERVICE ROLE key (or fallback).
 */
export const supabaseAdmin = createClient(env.supabaseUrl, serviceKey);

/**
 * Get an administrative / user-scoped Supabase client.
 * If SERVICE ROLE key is configured, uses that directly.
 * Otherwise, scopes the client with the admin user's JWT so Admin RLS policies apply.
 */
export function getAdminClient(reqOrToken) {
  if (env.supabaseServiceRoleKey) {
    return supabaseAdmin;
  }

  const token =
    typeof reqOrToken === "string"
      ? reqOrToken
      : reqOrToken?.token ||
        reqOrToken?.headers?.authorization?.replace(/^Bearer\s+/i, "");

  if (token) {
    return createClient(env.supabaseUrl, env.supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdmin;
}
