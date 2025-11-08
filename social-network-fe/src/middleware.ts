import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const authRoutes = ['/login', '/register'];
  const publicPaths = ['/public'];
  const semiPublicPaths = ['/user'];

  const sessionExpired = searchParams.get('session_expired') === 'true';
  if (pathname === '/login' && sessionExpired) {
    const cleanUrl = new URL('/login', request.url);
    const res = NextResponse.redirect(cleanUrl);

    const cookieOptions = { path: '/', httpOnly: true, maxAge: -1 };
    res.cookies.set('accessToken', '', cookieOptions);
    res.cookies.set('refreshToken', '', cookieOptions);

    return res;
  }

  let isPublic = false;
  const allPublicLikePaths = [
    ...authRoutes,
    ...publicPaths,
    ...semiPublicPaths,
  ];

  if (
    allPublicLikePaths.some(
      (path) => pathname === path || pathname.startsWith(path + '/')
    )
  ) {
    isPublic = true;
  }

  const res = NextResponse.next();
  res.headers.set('x-route-public', isPublic ? 'true' : 'false');
  res.headers.set(
    'x-route-url',
    `${pathname}${searchParams ? '?' + searchParams : ''}`
  );

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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (ALL _next files: static, internal, image, etc.)
     * - Any file that has a file extension (e.g., .png, .css, .js, .ts, .ico)
     */
    '/((?!api|_next|.*\\..*).*)',
  ],
};
