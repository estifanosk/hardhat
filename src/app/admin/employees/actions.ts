'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

function generateQrCode(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `emp-${slug}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createEmployee(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const role = formData.get('role') as string;
  const company = formData.get('company') as string;

  const { data, error } = await supabase
    .from('employees')
    .insert({ name, role, company, qr_code: generateQrCode(name) })
    .select('id')
    .single();

  if (error) redirect('/admin/employees?error=Failed+to+create+employee');

  redirect(`/admin/employees/${data.id}`);
}

export async function updateEmployee(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const role = formData.get('role') as string;
  const company = formData.get('company') as string;

  const { error } = await supabase
    .from('employees')
    .update({ name, role, company })
    .eq('id', id);

  if (error) redirect(`/admin/employees/${id}?error=Failed+to+update`);

  revalidatePath(`/admin/employees/${id}`);
  revalidatePath('/admin/employees');
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient();
  await supabase.from('employees').delete().eq('id', id);
  redirect('/admin/employees');
}

export async function addCertification(employeeId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const issuingBody = formData.get('issuing_body') as string;
  const issueDate = formData.get('issue_date') as string;
  const expiryDate = (formData.get('expiry_date') as string) || null;

  const { error } = await supabase.from('certifications').insert({
    employee_id: employeeId,
    name,
    type,
    issuing_body: issuingBody || null,
    issue_date: issueDate,
    expiry_date: expiryDate,
  });

  if (error) redirect(`/admin/employees/${employeeId}?error=Failed+to+add+certification`);

  revalidatePath(`/admin/employees/${employeeId}`);
}

export async function deleteCertification(certId: string, employeeId: string) {
  const supabase = await createClient();
  await supabase.from('certifications').delete().eq('id', certId);
  revalidatePath(`/admin/employees/${employeeId}`);
}

export async function linkProfile(employeeId: string, formData: FormData) {
  const supabase = await createClient();
  const profileId = (formData.get('profile_id') as string) || null;

  const { error } = await supabase
    .from('employees')
    .update({ profile_id: profileId })
    .eq('id', employeeId);

  if (error) redirect(`/admin/employees/${employeeId}?error=Failed+to+link+account`);
  revalidatePath(`/admin/employees/${employeeId}`);
}
