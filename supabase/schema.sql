-- ============================================================
-- HardHat Phase 1 Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Profiles (extends auth.users with role)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'safety_admin', 'foreman', 'employee', 'mechanic', 'viewer')),
  site TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper to check admin role without triggering RLS recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'safety_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (is_admin());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  photo_url TEXT,
  overall_status TEXT NOT NULL DEFAULT 'compliant'
    CHECK (overall_status IN ('compliant', 'expiring_soon', 'non_compliant')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- QR scan pages are public — anyone with the link can view
CREATE POLICY "Public can view employees" ON employees
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage employees" ON employees
  FOR ALL USING (
    is_admin()
  );

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('certification', 'license', 'task_training')),
  issuing_body TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expiring_soon', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view certifications" ON certifications
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage certifications" ON certifications
  FOR ALL USING (
    is_admin()
  );

-- Auto-compute cert status on insert/update
CREATE OR REPLACE FUNCTION compute_cert_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date IS NULL THEN
    NEW.status := 'active';
  ELSIF NEW.expiry_date < CURRENT_DATE THEN
    NEW.status := 'expired';
  ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    NEW.status := 'expiring_soon';
  ELSE
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER cert_status_trigger
  BEFORE INSERT OR UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION compute_cert_status();

-- ============================================================
-- Equipment tables
-- ============================================================

CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  identifier TEXT NOT NULL,
  site TEXT NOT NULL,
  photo_url TEXT,
  overall_status TEXT NOT NULL DEFAULT 'needs_inspection'
    CHECK (overall_status IN ('ready', 'needs_inspection', 'out_of_service')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Admins can manage equipment" ON equipment FOR ALL USING (
  is_admin()
);

CREATE TABLE IF NOT EXISTS equipment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expiring_soon', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE equipment_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view equipment_documents" ON equipment_documents FOR SELECT USING (true);
CREATE POLICY "Admins can manage equipment_documents" ON equipment_documents FOR ALL USING (
  is_admin()
);

-- Auto-compute document status
CREATE OR REPLACE FUNCTION compute_doc_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date IS NULL THEN
    NEW.status := 'active';
  ELSIF NEW.expiry_date < CURRENT_DATE THEN
    NEW.status := 'expired';
  ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    NEW.status := 'expiring_soon';
  ELSE
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER doc_status_trigger
  BEFORE INSERT OR UPDATE ON equipment_documents
  FOR EACH ROW EXECUTE FUNCTION compute_doc_status();

-- Auto-compute equipment overall_status from documents
CREATE OR REPLACE FUNCTION compute_equipment_status()
RETURNS TRIGGER AS $$
DECLARE
  eq_id UUID;
  has_expired BOOLEAN;
  has_expiring BOOLEAN;
BEGIN
  eq_id := COALESCE(NEW.equipment_id, OLD.equipment_id);
  SELECT
    EXISTS (SELECT 1 FROM equipment_documents WHERE equipment_id = eq_id AND status = 'expired'),
    EXISTS (SELECT 1 FROM equipment_documents WHERE equipment_id = eq_id AND status = 'expiring_soon')
  INTO has_expired, has_expiring;

  UPDATE equipment SET
    overall_status = CASE
      WHEN has_expired THEN 'out_of_service'
      WHEN has_expiring THEN 'needs_inspection'
      ELSE 'ready'
    END,
    updated_at = NOW()
  WHERE id = eq_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER equipment_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON equipment_documents
  FOR EACH ROW EXECUTE FUNCTION compute_equipment_status();

CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  inspector_name TEXT NOT NULL,
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspection_time TEXT,
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'needs_attention')),
  notes TEXT,
  checklist_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view inspections" ON inspections FOR SELECT USING (true);
CREATE POLICY "Public can insert inspections" ON inspections FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage inspections" ON inspections FOR ALL USING (
  is_admin()
);

-- ============================================================
-- Auto-compute employee overall_status after cert changes
CREATE OR REPLACE FUNCTION compute_employee_status()
RETURNS TRIGGER AS $$
DECLARE
  emp_id UUID;
  has_expired BOOLEAN;
  has_expiring BOOLEAN;
BEGIN
  emp_id := COALESCE(NEW.employee_id, OLD.employee_id);

  SELECT
    EXISTS (SELECT 1 FROM certifications WHERE employee_id = emp_id AND status = 'expired'),
    EXISTS (SELECT 1 FROM certifications WHERE employee_id = emp_id AND status = 'expiring_soon')
  INTO has_expired, has_expiring;

  UPDATE employees SET
    overall_status = CASE
      WHEN has_expired THEN 'non_compliant'
      WHEN has_expiring THEN 'expiring_soon'
      ELSE 'compliant'
    END,
    updated_at = NOW()
  WHERE id = emp_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER employee_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON certifications
  FOR EACH ROW EXECUTE FUNCTION compute_employee_status();
