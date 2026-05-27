import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import { getRoleHome } from '@/lib/auth/role-home';
import { NextResponse, type NextRequest } from 'next/server';

type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email';

type ResponseCookie = {
  name: string;
  value: string;
  options: CookieOptionsWithName;
};

type AuthCallbackClient = {
  auth: {
    exchangeCodeForSession(code: string): Promise<{ data: { user: { id: string } | null }; error: { message: string } | null }>;
    verifyOtp(params: { token_hash: string; type: EmailOtpType }): Promise<{ data: { user: { id: string } | null }; error: { message: string } | null }>;
  };
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        single(): Promise<{ data: { role: string | null } | null }>;
      };
    };
  };
};

type CreateAuthCallbackClient = (request: NextRequest, cookiesToSet: ResponseCookie[]) => AuthCallbackClient;

const createSupabaseAuthCallbackClient = createServerClient as unknown as (
  supabaseUrl: string,
  supabaseKey: string,
  options: {
    cookies: {
      getAll(): ReturnType<NextRequest['cookies']['getAll']>;
      setAll(cookies: ResponseCookie[]): void;
    };
  }
) => AuthCallbackClient;

function getBaseUrl(request: NextRequest, origin: string): string {
  if (process.env.NODE_ENV === 'development') return origin;
  const forwardedHost = request.headers.get('x-forwarded-host');
  return forwardedHost ? `https://${forwardedHost}` : origin;
}

function createAuthCallbackClient(request: NextRequest, cookiesToSet: ResponseCookie[]): AuthCallbackClient {
  return createSupabaseAuthCallbackClient(
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
}

export async function handleAuthCallback(
  request: NextRequest,
  createClientForRequest: CreateAuthCallbackClient = createAuthCallbackClient
) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const base = getBaseUrl(request, origin);
  const cookiesToSet: ResponseCookie[] = [];

  function redirectWithAuthCookies(path: string) {
    const response = NextResponse.redirect(`${base}${path}`);
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  }

  if (!code && (!token_hash || !type)) {
    return redirectWithAuthCookies('/login?error=Link+expired+or+invalid');
  }

  const supabase = createClientForRequest(request, cookiesToSet);
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
  }

  if (!userId) {
    return redirectWithAuthCookies('/login?error=Link+expired+or+invalid');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return redirectWithAuthCookies(getRoleHome(profile?.role));
}

export async function GET(request: NextRequest) {
  return handleAuthCallback(request);
}
