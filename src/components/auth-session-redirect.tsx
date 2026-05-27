'use client';

import { createClient } from '@/lib/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ROLE_HOME: Record<string, string> = {
  super_admin: '/admin/employees',
  safety_admin: '/admin/employees',
  foreman: '/foreman',
  employee: '/employee',
  mechanic: '/mechanic',
  viewer: '/dashboard',
};

const PUBLIC_AUTH_PATHS = new Set(['/', '/login', '/auth/callback']);

export function AuthSessionRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!PUBLIC_AUTH_PATHS.has(pathname)) return;

    const supabase = createClient();
    let active = true;

    async function redirectToRoleHome() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active || !user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const home = ROLE_HOME[profile?.role ?? ''] ?? '/dashboard';
      router.replace(home);
      router.refresh();
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        void redirectToRoleHome();
      }
    });

    void redirectToRoleHome();

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
