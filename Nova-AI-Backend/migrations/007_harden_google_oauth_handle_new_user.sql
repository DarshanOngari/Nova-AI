-- Migration: 007_harden_google_oauth_handle_new_user.sql
-- Description: Harden handle_new_user() trigger for Google OAuth and other third-party
--              providers where username might not be present in raw_user_meta_data.
--              Ensures generated usernames always conform to 3-20 char format (letters, numbers, underscores).
-- Tables:      public.users
-- Trigger:     on_auth_user_created (AFTER INSERT ON auth.users)

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
  -- 1. Try explicit username passed during email/password signup
  chosen_username := TRIM(NEW.raw_user_meta_data ->> 'username');

  -- If empty, derive from Google OAuth full_name/name or email prefix
  IF chosen_username IS NULL OR chosen_username = '' THEN
    base_username := TRIM(COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    ));

    -- Sanitize: replace non-alphanumeric characters with underscore
    base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '_', 'g');
    -- Collapse multiple consecutive underscores
    base_username := regexp_replace(base_username, '_+', '_', 'g');
    -- Strip leading and trailing underscores
    base_username := trim(both '_' from base_username);

    -- Ensure minimum length of 3 characters
    IF char_length(base_username) < 3 THEN
      base_username := 'user_' || COALESCE(NULLIF(base_username, ''), substr(md5(NEW.id::text), 1, 6));
    END IF;

    -- Truncate base to max 15 chars so appending a 5-char suffix (_xxxx) never exceeds 20
    base_username := substr(base_username, 1, 15);
    chosen_username := base_username;

    -- Resolve collisions with random suffix
    WHILE EXISTS (SELECT 1 FROM public.users WHERE LOWER(username) = LOWER(chosen_username)) LOOP
      suffix := substr(md5(random()::text), 1, 4);
      chosen_username := substr(base_username, 1, 15) || '_' || suffix;
      attempt := attempt + 1;
      IF attempt > 10 THEN
        chosen_username := 'user_' || substr(md5(NEW.id::text), 1, 12);
        EXIT;
      END IF;
    END LOOP;
  ELSE
    -- Sanitize explicit username if provided
    chosen_username := regexp_replace(chosen_username, '[^a-zA-Z0-9_]', '_', 'g');
    IF char_length(chosen_username) < 3 THEN
      chosen_username := chosen_username || '_' || substr(md5(NEW.id::text), 1, 3);
    END IF;
    chosen_username := substr(chosen_username, 1, 20);
  END IF;

  INSERT INTO public.users (id, username, email, role)
  VALUES (NEW.id, chosen_username, NEW.email, 'user')
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Re-create trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security hardening: revoke direct execution from non-service roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
