import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import { getRoleHome } from '@/lib/auth/role-home';
import { NextResponse, type NextRequest } from 'next/server';

type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email';

type ResponseCookie = {
  name: string;
  value: string;
  options: CookieOptionsWithName;
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
  const base = getBaseUrl(request, origin);
  const cookiesToSet: ResponseCookie[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(newCookies) {
          cookiesToSet.push(...newCookies);
        },
      },
    }
  );

  function redirectWithAuthCookies(path: string) {
    const response = NextResponse.redirect(`${base}${path}`);
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  }

  let userId: string | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return redirectWithAuthCookies(`/login?error=${encodeURIComponent(error?.message ?? 'Link expired or invalid')}`);
    }
    userId = data.user.id;
  } else if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as EmailOtpType });
    if (error || !data.user) {
      return redirectWithAuthCookies(`/login?error=${encodeURIComponent(error?.message ?? 'Link expired or invalid')}`);
    }
    userId = data.user.id;
  } else {
    return redirectWithAuthCookies('/login?error=Link+expired+or+invalid');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return redirectWithAuthCookies(getRoleHome(profile?.role));
}
