-- Migration: 001_add_fk_indexes.sql
-- Description: Add covering indexes on all unindexed foreign key columns.
--              Fixes: Performance advisor warning "Unindexed foreign keys"
--              Improves: RLS policy evaluation, JOIN performance, and
--                        query speed when loading conversations + messages.
-- Tables:      public.conversations, public.messages
-- Applied via: Supabase MCP apply_migration

-- ─────────────────────────────────────────────────────────────────────────────
-- conversations.user_id
--   Used by: RLS policy (WHERE user_id = auth.uid())
--             JOIN when loading user's conversation list
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_conversations_user_id
  ON public.conversations (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- messages.conversation_id
--   Used by: Nested SELECT messages(*) inside conversations query
--             Foreign key enforcement on cascade delete
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON public.messages (conversation_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- messages.user_id
--   Used by: RLS policy (WHERE user_id = auth.uid())
--             Direct user→messages queries
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_user_id
  ON public.messages (user_id);
