-- Migration: 005_allow_public_select_users.sql
-- Description: Allow public (anon + authenticated) SELECT access on public.users
--              so that username availability checks before signup and public profile
--              lookups work properly when querying with the anon key.
-- Tables:      public.users

-- Drop restrictive authenticated-only SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.users;

-- Recreate SELECT policy allowing public (anon + authenticated) read
CREATE POLICY "Public read access for user profiles"
  ON public.users
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);
