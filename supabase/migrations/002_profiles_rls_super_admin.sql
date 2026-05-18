-- ============================================================
-- Migration 002: Allow super_admin to read all profiles
-- Needed for the User Management page to list all users.
-- Run with: npm run db supabase/migrations/002_profiles_rls_super_admin.sql
-- ============================================================

-- Super admin needs to SELECT all profiles (not just own)
-- The existing "Super admin can manage all profiles" policy covers FOR ALL
-- but only if it was applied after migration 001. Re-applying here to be safe.

DROP POLICY IF EXISTS "Super admin can manage all profiles" ON profiles;

CREATE POLICY "Super admin can manage all profiles" ON profiles
  FOR ALL USING (is_super_admin());
