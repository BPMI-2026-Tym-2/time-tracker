import { NextResponse, type NextRequest } from 'next/server';

// Better Auth nastavuje cookie se session; na HTTPS má prefix __Secure-.
// Jde jen o optimistickou kontrolu. Skutečná autorizace je vždy na backendu.
const sessionCookieNames = ['better-auth.session_token', '__Secure-better-auth.session_token'];

export function proxy(request: NextRequest) {
  const hasSessionCookie = sessionCookieNames.some((name) => request.cookies.has(name));

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/users/:path*'],
};
