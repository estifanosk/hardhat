'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getRoleHome } from '@/lib/auth/role-home';
import { getSiteUrl } from '@/lib/auth/site-url';
import { isMagicLinkAuthEnabled } from '@/lib/auth/feature-flags';

export async function signInWithPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? 'Invalid email or password')}`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  redirect(getRoleHome(profile?.role));
}

export async function sendMagicLink(formData: FormData) {
  if (!isMagicLinkAuthEnabled()) {
    redirect('/login?error=Magic+link+sign-in+is+temporarily+disabled');
  }

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
