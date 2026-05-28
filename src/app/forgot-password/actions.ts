'use server';

import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/auth/site-url';
import { redirect } from 'next/navigation';

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/forgot-password?sent=1&email=${encodeURIComponent(email)}`);
}
