-- ============================================================
-- Migration 003: Link employees table to auth profiles
-- Allows employees to log in and see their own records.
-- Run with: npm run db supabase/migrations/003_employee_profile_link.sql
-- ============================================================

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_profile_id
  ON employees(profile_id) WHERE profile_id IS NOT NULL;
