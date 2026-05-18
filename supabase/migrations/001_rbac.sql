-- ============================================================
-- Migration 001: Full RBAC role system
-- Run with: npm run db supabase/migrations/001_rbac.sql
-- ============================================================

-- 1. Add site column to profiles (for foreman scoping)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS site TEXT;

-- 2. Drop constraint first so existing data can't block updates
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. Migrate existing data
UPDATE public.profiles SET role = 'super_admin' WHERE role = 'admin';
UPDATE public.profiles SET role = 'viewer' WHERE role NOT IN ('super_admin', 'safety_admin', 'foreman', 'employee', 'mechanic', 'viewer');

-- 4. Add new constraint
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'safety_admin', 'foreman', 'employee', 'mechanic', 'viewer'));

-- Update default role for new signups
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'viewer';

-- ============================================================
-- 4. Role helper functions (SECURITY DEFINER bypasses RLS)
-- ============================================================

-- True for super_admin only
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- True for super_admin OR safety_admin
CREATE OR REPLACE FUNCTION is_safety_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'safety_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- True for any field worker role
CREATE OR REPLACE FUNCTION is_field_worker()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('foreman', 'employee', 'mechanic')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- True for mechanic
CREATE OR REPLACE FUNCTION is_mechanic()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'mechanic'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Update existing is_admin() to cover super_admin + safety_admin (used by existing code)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'safety_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 5. Profiles policies
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admin can manage all profiles" ON profiles
  FOR ALL USING (is_super_admin());

-- ============================================================
-- 6. Employees policies
-- ============================================================
DROP POLICY IF EXISTS "Public can view employees" ON employees;
DROP POLICY IF EXISTS "Admins can manage employees" ON employees;

-- Public SELECT is required for unauthenticated QR scan pages
CREATE POLICY "Public can view employees" ON employees
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage employees" ON employees
  FOR ALL USING (is_safety_admin());

-- ============================================================
-- 7. Certifications policies
-- ============================================================
DROP POLICY IF EXISTS "Public can view certifications" ON certifications;
DROP POLICY IF EXISTS "Admins can manage certifications" ON certifications;

CREATE POLICY "Public can view certifications" ON certifications
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage certifications" ON certifications
  FOR ALL USING (is_safety_admin());

-- ============================================================
-- 8. Equipment policies
-- ============================================================
DROP POLICY IF EXISTS "Public can view equipment" ON equipment;
DROP POLICY IF EXISTS "Admins can manage equipment" ON equipment;
DROP POLICY IF EXISTS "Admins and mechanics can manage equipment" ON equipment;

CREATE POLICY "Public can view equipment" ON equipment
  FOR SELECT USING (true);

CREATE POLICY "Admins and mechanics can manage equipment" ON equipment
  FOR ALL USING (is_safety_admin() OR is_mechanic());

-- ============================================================
-- 9. Equipment documents policies
-- ============================================================
DROP POLICY IF EXISTS "Public can view equipment_documents" ON equipment_documents;
DROP POLICY IF EXISTS "Admins can manage equipment_documents" ON equipment_documents;
DROP POLICY IF EXISTS "Admins and mechanics can manage equipment_documents" ON equipment_documents;

CREATE POLICY "Public can view equipment_documents" ON equipment_documents
  FOR SELECT USING (true);

CREATE POLICY "Admins and mechanics can manage equipment_documents" ON equipment_documents
  FOR ALL USING (is_safety_admin() OR is_mechanic());

-- ============================================================
-- 10. Inspections policies
-- ============================================================
DROP POLICY IF EXISTS "Public can view inspections" ON inspections;
DROP POLICY IF EXISTS "Public can insert inspections" ON inspections;
DROP POLICY IF EXISTS "Admins can manage inspections" ON inspections;

CREATE POLICY "Public can view inspections" ON inspections
  FOR SELECT USING (true);

-- Any authenticated or unauthenticated user can submit an inspection (field use)
CREATE POLICY "Anyone can insert inspections" ON inspections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage inspections" ON inspections
  FOR ALL USING (is_safety_admin());
