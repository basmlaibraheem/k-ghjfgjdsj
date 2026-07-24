/*
# Auto-create profile on signup + admin helper

1. Trigger
   - When a new user registers in auth.users, automatically insert a row in profiles
   with their id, full_name from user_metadata, and default loyalty_points=0.
2. Function
   - set_admin(email) — sets raw_app_meta_data.is_admin = true for the given user,
   so the admin RLS policies and frontend admin check recognize them.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_admin(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = auth
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
  WHERE email = p_email;
END;
$$;
