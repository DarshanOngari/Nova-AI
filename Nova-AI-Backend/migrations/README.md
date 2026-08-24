# Migrations

This folder contains all Supabase (PostgreSQL) migrations for Nova AI.

## Naming Convention
```
<series_number>_<short_description>.sql
```
- Series numbers are zero-padded to 3 digits: `001`, `002`, ...
- Short description uses underscores and is lowercase: `add_fk_indexes`
- Always include a comment header inside each file explaining what it does and why.

## How to Apply

### Option A — Apply via Supabase Dashboard (SQL Editor)
1. Go to [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/jasgmwrurlzjywvmvyxs/sql)
2. Copy the contents of each `.sql` file **in order** and run it.

### Option B — Apply via Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref jasgmwrurlzjywvmvyxs

# Run a migration manually
supabase db push
```

## Migration Log

| # | File | Description | Advisor Lint / Issue Fixed |
|---|------|-------------|-------------------|
| 001 | `001_add_fk_indexes.sql` | Add covering indexes on all unindexed FK columns (`conversations.user_id`, `messages.conversation_id`, `messages.user_id`) | `unindexed_foreign_keys` (INFO) |
| 002 | `002_optimize_rls_policies.sql` | Optimize RLS policies on `conversations` and `messages` by wrapping `auth.uid()` in a subselect `(select auth.uid())` to avoid per-row re-evaluation | `auth_rls_initplan` (WARN) |
| 003 | `003_drop_auto_confirm_user_trigger.sql` | Drop the `on_auth_user_created` trigger on `auth.users` that was forcibly setting `email_confirmed_at = NOW()` on every signup, bypassing OTP verification | Direct signup bypass bug |
| 004 | `004_create_users_table.sql` | Create `public.users` table (username, email, role), unique case-insensitive index on username, RLS policies, and `handle_new_user()` AFTER INSERT trigger to auto-create profiles on signup with default `role: 'user'` | New feature — User profiles |
| 005 | `005_allow_public_select_users.sql` | Allow public (anon + authenticated) SELECT access on `public.users` so pre-signup username availability checks work properly when querying with the anon key | Username availability bug |
| 006 | `006_admin_relations_and_security.sql` | Add FK constraints from conversations & messages to public.users and revoke public execution of handle_new_user() | PostgREST relations & security |
| 007 | `007_harden_google_oauth_handle_new_user.sql` | Harden handle_new_user() trigger for Google OAuth and social logins to guarantee valid 3-20 char username generation | Google OAuth & metadata fallback |

