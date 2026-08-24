-- Migration: 006_admin_relations_and_security.sql
-- Description: Add foreign key constraints from public.conversations and
--              public.messages to public.users to enable PostgREST relational
--              joins and ensure database referential integrity. Also revokes
--              public execution of handle_new_user() security definer function.
-- Tables:      public.conversations, public.messages, public.users
-- Applied via: Supabase MCP

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add foreign key from public.conversations(user_id) to public.users(id)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'conversations_user_id_users_fkey'
  ) THEN
    ALTER TABLE public.conversations
      ADD CONSTRAINT conversations_user_id_users_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Add foreign key from public.messages(user_id) to public.users(id)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'messages_user_id_users_fkey'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_user_id_users_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Security Hardening: Revoke direct execution of handle_new_user()
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
