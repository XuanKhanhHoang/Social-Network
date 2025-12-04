'use client';
import { useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateEmail } from '@/lib/utils/validation';
import { authService } from '@/features/auth/services/auth.service';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

interface FormErrors {
  email?: string;
}

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const formRef = useRef<HTMLFormElement>(null);

  const getFormData = (): Record<string, string> => {
    if (!formRef.current) return {};

    const formData = new FormData(formRef.current);
    return Object.fromEntries(formData.entries()) as Record<string, string>;
  };

  const validateForm = (data: Record<string, string>): FormErrors => {
    const newErrors: FormErrors = {};
    const emailValidation = validateEmail(data.email || '');
    if (!emailValidation.isValid) newErrors.email = emailValidation?.error;
    return newErrors;
  };

  const handleFieldBlur = (fieldName: string) => {
    const data = getFormData();
    const fieldErrors = validateForm(data);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldErrors[fieldName as keyof FormErrors],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = getFormData();
    const newErrors = validateForm(data);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await authService.forgotPassword(data.email);
        setIsSuccess(true);
        toast.success('Mật khẩu mới đã được gửi đến email của bạn!');
      } catch (error: unknown) {
        const errorMessage =
          (error as { message?: string })?.message ||
          'Có lỗi xảy ra, vui lòng thử lại!';
        toast.error(errorMessage);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="flex min-h-screen lg:flex-row flex-col">
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-lg">
            <div className="mb-6">
              <Image
                src="/logo.png"
                alt="Vibe Logo"
                className="h-36"
                width={144}
                height={144}
              />
            </div>
            <p className="text-gray-700 text-lg font-semibold lg:font-normal lg:text-2xl leading-relaxed">
              Vibe giúp bạn kết nối và chia sẻ với mọi người trong cuộc sống.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl rounded-md">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800 text-center">
                  Quên mật khẩu
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {!isSuccess ? (
                  <>
                    <p className="text-gray-600 text-sm text-center mb-4">
                      Nhập email của bạn và chúng tôi sẽ gửi mật khẩu mới cho
                      bạn.
                    </p>

                    <form ref={formRef} onSubmit={handleSubmit}>
                      <div className="space-y-2 mb-4">
                        <Input
                          name="email"
                          type="email"
                          placeholder="Email"
                          onBlur={() => handleFieldBlur('email')}
                          className={`h-12 text-base rounded-md ${
                            errors.email
                              ? 'border-red-500 focus-visible:ring-red-500'
                              : ''
                          }`}
                        />
                        {errors.email && (
                          <Alert
                            variant="destructive"
                            className="py-1 border-none"
                          >
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              {errors.email}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 text-lg font-semibold cursor-pointer bg-blue-500 hover:bg-blue-600 mb-4 rounded-md"
                        size="lg"
                      >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi mật khẩu mới'}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Kiểm tra email của bạn
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Chúng tôi đã gửi mật khẩu mới đến email của bạn. Vui lòng
                      kiểm tra hộp thư đến (và thư mục spam).
                    </p>
                  </div>
                )}

                <div className="text-center pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    asChild
                  >
                    <Link href="/login">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Quay lại đăng nhập
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="hidden lg:block fixed bottom-0 w-full bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-8">
          <p className="text-xs text-gray-400 text-center">
            KTH - KhanhPoPo © 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
