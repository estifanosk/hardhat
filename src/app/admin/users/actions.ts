'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

type Role = 'super_admin' | 'safety_admin' | 'foreman' | 'employee' | 'mechanic' | 'viewer';

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') redirect('/admin/employees');
}

function getPassword(formData: FormData) {
  const password = formData.get('password') as string;

  if (password.length < 8) {
    redirect('/admin/users?error=Password+must+be+at+least+8+characters');
  }

  return password;
}

export async function createUser(formData: FormData) {
  await requireSuperAdmin();

  const email = formData.get('email') as string;
  const role = formData.get('role') as Role;
  const full_name = formData.get('full_name') as string;
  const password = getPassword(formData);

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  // Set the role on the profile (trigger creates it as 'viewer' by default)
  await admin.from('profiles').upsert({
    id: data.user.id,
    email,
    full_name: full_name || null,
    role,
  });

  redirect('/admin/users?created=1');
}

export async function updateUserRole(userId: string, role: Role) {
  await requireSuperAdmin();

  const admin = createAdminClient();
  await admin.from('profiles').update({ role }).eq('id', userId);
  redirect('/admin/users');
}

export async function updateUserPassword(userId: string, formData: FormData) {
  await requireSuperAdmin();

  const password = getPassword(formData);
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/admin/users?password=1');
}

export async function deactivateUser(userId: string) {
  await requireSuperAdmin();

  const admin = createAdminClient();
  // Ban for 100 years = effectively deactivated
  await admin.auth.admin.updateUserById(userId, { ban_duration: '876600h' });
  redirect('/admin/users');
}

export async function reactivateUser(userId: string) {
  await requireSuperAdmin();

  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
  redirect('/admin/users');
}
