import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  console.log(
    `\n--- [MW] BẮT ĐẦU: ${request.method} ${pathname}${
      searchParams ? '?' + searchParams : ''
    }`
  );

  // === 1. ĐỊNH NGHĨA ROUTE ===
  const authRoutes = ['/login', '/register'];
  const publicPaths = ['/public'];
  const semiPublicPaths = ['/user'];

  // === 2. KỊCH BẢN XỬ LÝ SESSION HẾT HẠN ===
  const sessionExpired = searchParams.get('session_expired') === 'true';
  if (pathname === '/login' && sessionExpired) {
    console.log(
      '[MW] Kịch bản 1: Session hết hạn. Đang xóa cookies và REDIRECT về /login (sạch).'
    );

    const cleanUrl = new URL('/login', request.url);
    // Dùng redirect là đúng, để có một request mới sạch
    const res = NextResponse.redirect(cleanUrl);

    const cookieOptions = { path: '/', httpOnly: true, maxAge: -1 };
    res.cookies.set('accessToken', '', cookieOptions);
    res.cookies.set('refreshToken', '', cookieOptions);

    return res;
  }

  // === 3. KIỂM TRA TÍNH PUBLIC CỦA ROUTE ===
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

  console.log(
    `[MW] Phân loại: Route này là ${
      isPublic ? 'PUBLIC / SEMI-PUBLIC' : 'PRIVATE'
    }`
  );
  const res = NextResponse.next();
  res.headers.set('x-route-public', isPublic ? 'true' : 'false');
  res.headers.set(
    'x-route-url',
    `${pathname}${searchParams ? '?' + searchParams : ''}`
  );

  // === 4. KỊCH BẢN: USER ĐÃ LOGIN NHƯNG VÀO TRANG AUTH ===
  //
  // SỬA LỖI Ở ĐÂY: Chỉ redirect nếu có 'accessToken'.
  // Nếu chỉ có 'refreshToken', chúng ta giả định token đã hết hạn
  // và MUỐN user ở lại trang login.
  //
  if (authRoutes.includes(pathname) && accessToken) {
    // CHỈ CHECK accessToken
    console.log(
      '[MW] Kịch bản 4: User (có accessToken) vào trang auth. Redirect về /.'
    );
    return NextResponse.redirect(new URL('/', request.url));
  }

  // === 5. KỊCH BẢN: GUEST VÀO TRANG PRIVATE ===
  if (!isPublic) {
    if (!accessToken && !refreshToken) {
      console.log(
        '[MW] Kịch bản 5: Guest vào trang private. Redirect về /login.'
      );
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // === 6. KỊCH BẢN MẶC ĐỊNH: CHO ĐI TIẾP ===
  // Bây giờ kịch bản "vào /login chỉ với refreshToken" sẽ rơi vào đây.
  console.log('[MW] Kịch bản 6: Mặc định. Cho request đi tiếp (pass-through).');
  return res;
}

// Config matcher của bạn
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
