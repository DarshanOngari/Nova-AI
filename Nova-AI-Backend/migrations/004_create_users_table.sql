-- Migration: 004_create_users_table.sql
-- Description: Create public.users table for storing user profiles including
--              username (unique, case-insensitive), email, and role (user/admin).
--              Sets up RLS policies, performance indexes, and an AFTER INSERT
--              trigger on auth.users to auto-create a profile on signup.
-- Tables:      public.users
-- Trigger:     on_auth_user_created (AFTER INSERT ON auth.users)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Create public.users table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT username_length_format CHECK (
    char_length(username) >= 3 AND
    char_length(username) <= 20 AND
    username ~ '^[a-zA-Z0-9_]+$'
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Unique case-insensitive index on username + performance indexes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower
  ON public.users (LOWER(username));

CREATE INDEX IF NOT EXISTS idx_users_email
  ON public.users (email);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Enable Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3a. Any authenticated user can READ all profiles (for usernames, display info)
CREATE POLICY "Authenticated users can view all profiles"
  ON public.users
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (true);

-- 3b. Users can update ONLY their own row — AND cannot elevate their own role
CREATE POLICY "Users can update their own profile"
  ON public.users
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK (
    (SELECT auth.uid()) = id AND
    role = (SELECT role FROM public.users WHERE id = (SELECT auth.uid()))
  );

-- 3c. Service role (backend) has full access for admin tasks
CREATE POLICY "Service role full access"
  ON public.users
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Auto-create profile trigger (AFTER INSERT ON auth.users)
--    Picks username from raw_user_meta_data or falls back to email prefix + random
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  chosen_username TEXT;
  base_username   TEXT;
  suffix          TEXT;
  attempt         INT := 0;
BEGIN
  chosen_username := TRIM(NEW.raw_user_meta_data ->> 'username');

  -- Fallback: use email prefix if username not provided
  IF chosen_username IS NULL OR chosen_username = '' THEN
    base_username := regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g');
    base_username := substr(base_username, 1, 16);
    chosen_username := base_username;

    -- Resolve collisions with random suffix
    WHILE EXISTS (SELECT 1 FROM public.users WHERE LOWER(username) = LOWER(chosen_username)) LOOP
      suffix := substr(md5(random()::text), 1, 4);
      chosen_username := base_username || '_' || suffix;
      attempt := attempt + 1;
      IF attempt > 10 THEN
        chosen_username := 'user_' || substr(md5(NEW.id::text), 1, 8);
        EXIT;
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.users (id, username, email, role)
  VALUES (NEW.id, chosen_username, NEW.email, 'user')
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Recreate trigger (clean)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
