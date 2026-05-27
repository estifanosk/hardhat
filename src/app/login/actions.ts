'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getSiteUrl } from '@/lib/auth/site-url';

export async function sendMagicLink(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
