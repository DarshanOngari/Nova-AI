-- Migration: 009_add_attachments_to_messages.sql
-- Description: Add attachments column (JSONB) to public.messages to support
--              persisting image and document upload metadata and references.
-- Tables:      public.messages
-- Applied via: Supabase Dashboard (SQL Editor) or Supabase CLI

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add attachments column to public.messages
--    Stores array of attachment objects: [{ filename, mediaType, url, size }]
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Add comment for documentation
-- ─────────────────────────────────────────────────────────────────────────────
COMMENT ON COLUMN public.messages.attachments IS
  'JSON array of file attachments associated with this chat message (images, PDFs, documents)';
