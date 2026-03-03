
-- Drop all restrictive policies and recreate as permissive

-- user_roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() <> user_id);
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() <> user_id);

-- bolts
DROP POLICY IF EXISTS "Authenticated users can view bolts" ON public.bolts;
DROP POLICY IF EXISTS "Admins can insert bolts" ON public.bolts;
DROP POLICY IF EXISTS "Admins can update bolts" ON public.bolts;
DROP POLICY IF EXISTS "Admins can delete bolts" ON public.bolts;

CREATE POLICY "Authenticated users can view bolts" ON public.bolts FOR SELECT USING (true);
CREATE POLICY "Admins can insert bolts" ON public.bolts FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update bolts" ON public.bolts FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete bolts" ON public.bolts FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
