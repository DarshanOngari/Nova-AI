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
 * Supabase client using the SERVICE ROLE key (falls back to ANON key if not provided).
 * Bypasses RLS when service role key is configured.
 * ⚠️ NEVER expose this client or service role key to the frontend.
 */
export const supabaseAdmin = createClient(env.supabaseUrl, serviceKey);
