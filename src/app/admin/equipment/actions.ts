'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

function generateQrCode(identifier: string) {
  const slug = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `eq-${slug}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createEquipment(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const identifier = formData.get('identifier') as string;
  const site = formData.get('site') as string;

  const { data, error } = await supabase
    .from('equipment')
    .insert({ name, type, identifier, site, qr_code: generateQrCode(identifier) })
    .select('id')
    .single();

  if (error) redirect('/admin/equipment?error=Failed+to+create+equipment');

  redirect(`/admin/equipment/${data.id}`);
}

export async function updateEquipment(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const identifier = formData.get('identifier') as string;
  const site = formData.get('site') as string;

  await supabase.from('equipment').update({ name, type, identifier, site }).eq('id', id);

  revalidatePath(`/admin/equipment/${id}`);
  revalidatePath('/admin/equipment');
}

export async function deleteEquipment(id: string) {
  const supabase = await createClient();
  await supabase.from('equipment').delete().eq('id', id);
  redirect('/admin/equipment');
}

export async function addDocument(equipmentId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const expiryDate = (formData.get('expiry_date') as string) || null;

  await supabase.from('equipment_documents').insert({
    equipment_id: equipmentId,
    name,
    expiry_date: expiryDate,
  });

  revalidatePath(`/admin/equipment/${equipmentId}`);
}

export async function deleteDocument(docId: string, equipmentId: string) {
  const supabase = await createClient();
  await supabase.from('equipment_documents').delete().eq('id', docId);
  revalidatePath(`/admin/equipment/${equipmentId}`);
}

export async function setEquipmentStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from('equipment').update({ overall_status: status, updated_at: new Date().toISOString() }).eq('id', id);
  revalidatePath(`/admin/equipment/${id}`);
  revalidatePath('/admin/equipment');
}
