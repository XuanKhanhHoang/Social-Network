import { MailCheck } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const email = (await searchParams).email ?? 'yourmail@mail.com';
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-lg space-y-6 p-8">
        <CardHeader className="flex flex-col items-center gap-2 text-center">
          <MailCheck className="h-12 w-12 text-blue-500" />
          <CardTitle className="text-2xl">Vui lòng kiểm tra email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>
            Chúng tôi vừa gửi một email đến{' '}
            <span className="font-medium text-gray-900">{email}</span>. Vui lòng
            mở email và nhấn vào đường dẫn xác thực để kích hoạt tài khoản.
          </p>
          <div className="flex flex-col items-center space-y-4">
            <Button
              variant="secondary"
              className="px-8 h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base"
              asChild
            >
              <Link href="/login">Quay về trang đăng nhập</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
