-- Migration: 002_optimize_rls_policies.sql
-- Description: Fix RLS policies to prevent re-evaluation of auth.uid() on
--              every row. Replace bare auth.uid() with (select auth.uid())
--              so Postgres evaluates it once per statement, not once per row.
-- Tables:      public.conversations, public.messages
-- Advisor:     "Auth RLS Initialization Plan" (WARN) — Supabase performance lint
-- Reference:   https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan

-- ─────────────────────────────────────────────────────────────────────────────
-- conversations: drop old policy → recreate with optimized auth.uid() call
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage their own conversations" ON public.conversations;

CREATE POLICY "Users can manage their own conversations"
  ON public.conversations
  AS PERMISSIVE
  FOR ALL
  TO public
  USING      ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- messages: drop old policy → recreate with optimized auth.uid() call
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage their own messages" ON public.messages;

CREATE POLICY "Users can manage their own messages"
  ON public.messages
  AS PERMISSIVE
  FOR ALL
  TO public
  USING      ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
