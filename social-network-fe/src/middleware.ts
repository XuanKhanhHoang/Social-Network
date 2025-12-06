import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const authRoutes = ['/login', '/register', '/forgot-password'];
  const adminAuthRoutes = ['/admin/login'];

  const publicPaths = ['/public'];
  const semiPublicPaths = ['/user'];

  let isPublic = false;
  let isSemiPublic = false;
  let isAdminRoute = false;

  const trulyPublicPaths = [...authRoutes, ...publicPaths, ...adminAuthRoutes];

  if (pathname.startsWith('/admin')) {
    isAdminRoute = true;

    if (
      adminAuthRoutes.some(
        (path) => pathname === path || pathname.startsWith(path + '/')
      )
    ) {
      isPublic = true;
    }
  }

  if (
    trulyPublicPaths.some(
      (path) => pathname === path || pathname.startsWith(path + '/')
    )
  ) {
    isPublic = true;
  }

  if (
    semiPublicPaths.some(
      (path) => pathname.startsWith(path + '/') || pathname == path
    )
  ) {
    isSemiPublic = true;
  }

  const res = NextResponse.next();
  res.headers.set('x-route-public', isPublic ? 'true' : 'false');
  res.headers.set('x-route-semi-public', isSemiPublic ? 'true' : 'false');
  res.headers.set('x-route-admin', isAdminRoute ? 'true' : 'false');
  res.headers.set(
    'x-route-url',
    `${pathname}${searchParams ? '?' + searchParams : ''}`
  );

  if (isAdminRoute && !isPublic && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (
    !isPublic &&
    !isSemiPublic &&
    !isAdminRoute &&
    !accessToken &&
    !refreshToken
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (
    adminAuthRoutes.some(
      (path) => pathname === path || pathname.startsWith(path + '/')
    ) &&
    (accessToken || refreshToken)
  ) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  if (
    authRoutes.some(
      (path) => pathname === path || pathname.startsWith(path + '/')
    ) &&
    (accessToken || refreshToken)
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (ALL _next files: static, internal, image, etc.)
     * - Any file that has a file extension (e.g., .png, .css, .js, .ts, .ico)
     */
    '/((?!api|_next|.*\\..*).*)',
  ],
};
