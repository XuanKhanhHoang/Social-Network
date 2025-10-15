import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/', '/profile', '/feed', '/settings'];
  const authRoutes = ['/login', '/register'];

  const res = NextResponse.next();

  let isPublic = true;

  if (
    pathname.startsWith('/public/') ||
    authRoutes.includes(pathname) ||
    authRoutes.some((route) => pathname.startsWith(route))
  ) {
    isPublic = true;
  } else {
    isPublic = false;
  }
  res.headers.set('x-route-public', isPublic ? 'true' : 'false');

  if (authRoutes.includes(pathname) && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublic) {
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images|.*\\..*$).*)',
  ],
};
