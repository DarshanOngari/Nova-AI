-- Migration: 008_admin_user_management_rls.sql
-- Description: Add admin RLS policies on public.users allowing administrators
--              to update user roles (promote/demote) and delete users.
-- Tables:      public.users
-- Applied via: Supabase MCP

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Helper function: is_admin()
--    Evaluates whether the current authenticated user has an 'admin' role.
--    SECURITY DEFINER prevents recursive policy evaluation on public.users.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.users WHERE id = (SELECT auth.uid())),
    false
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RLS UPDATE Policy: Admins can update all user profiles & roles
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
CREATE POLICY "Admins can update all profiles"
  ON public.users
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RLS DELETE Policy: Admins can delete users
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users"
  ON public.users
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
