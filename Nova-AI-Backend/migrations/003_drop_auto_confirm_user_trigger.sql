-- Migration: 003_drop_auto_confirm_user_trigger.sql
-- Description: Drop the PostgreSQL trigger and function on auth.users that was
--              automatically setting email_confirmed_at = NOW() on every signup,
--              which completely bypassed email confirmation and OTP verification.
-- Tables:      auth.users

-- 1. Drop the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the auto_confirm_user function
DROP FUNCTION IF EXISTS public.auto_confirm_user();
DROP FUNCTION IF EXISTS auto_confirm_user();
