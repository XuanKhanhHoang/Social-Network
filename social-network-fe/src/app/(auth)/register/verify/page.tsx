import { authService } from '@/features/auth/services/auth.service';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token;

  if (!token || token === '') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full text-center shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Xác thực email</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <XCircle className="h-5 w-5 text-red-500" />
              <AlertTitle>Thiếu token</AlertTitle>
              <AlertDescription>
                Không tìm thấy token xác thực. Vui lòng kiểm tra lại email của
                bạn.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button variant="outline" className="rounded-2xl px-6">
                Quay lại đăng nhập
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  try {
    const verifyResult = await authService.verifyEmail(token);

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full text-center shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Xác thực email</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-green-500">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <AlertTitle>Thành công</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Email của bạn đã được xác thực thành công, bạn có thể đăng
                  nhập ngay bây giờ!
                </p>
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700 w-full">
                  <Mail className="h-4 w-4" />
                  <span>{verifyResult.user.email}</span>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button className="rounded-2xl px-6">Đăng nhập</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  } catch (error: unknown) {
    let message = 'Xác thực thất bại do lỗi bất định, vui lòng thử lại sau!';
    if ((error as { status?: number; message?: string })?.status === 400) {
      message =
        'Token không hợp lệ, đã hết hạn hoặc đã được xác thực trước đó.';
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full text-center shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Xác thực email</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button variant="outline" className="rounded-2xl px-6">
                Quay lại đăng nhập
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
}
