'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (password.length < 8) {
    redirect('/reset-password?error=Password+must+be+at+least+8+characters');
  }

  if (password !== confirmPassword) {
    redirect('/reset-password?error=Passwords+do+not+match');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.auth.signOut();
  redirect('/login?message=Password+updated.+Sign+in+with+your+new+password.');
}
