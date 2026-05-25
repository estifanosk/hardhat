import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

const ROLE_HOME: Record<string, string> = {
  super_admin: '/admin/employees',
  safety_admin: '/admin/employees',
  foreman: '/foreman',
  employee: '/employee',
  mechanic: '/mechanic',
};

function getBaseUrl(request: NextRequest, origin: string): string {
  if (process.env.NODE_ENV === 'development') return origin;
  const forwardedHost = request.headers.get('x-forwarded-host');
  return forwardedHost ? `https://${forwardedHost}` : origin;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  const supabase = await createClient();
  const base = getBaseUrl(request, origin);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(`${base}/login?error=Link+expired+or+invalid`);
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'magiclink' | 'email' });
    if (error) return NextResponse.redirect(`${base}/login?error=Link+expired+or+invalid`);
  } else {
    return NextResponse.redirect(`${base}/login?error=Link+expired+or+invalid`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${base}/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const home = ROLE_HOME[profile?.role ?? ''] ?? '/login';
  return NextResponse.redirect(`${base}${home}`);
}
