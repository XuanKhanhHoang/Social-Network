'use client';
import { useRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { validateEmail } from '@/lib/utils/validation';
import { authService } from '@/features/auth/services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useStore } from '@/store';
import { transformToStoreUser } from '@/features/auth/store/authSlice';
import Image from 'next/image';

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginForm = () => {
  const minPasswordLength = 6;
  const setUser = useStore((state) => state.setUser);
  const setKeyVault = useStore((state) => state.setKeyVault);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

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
    if (!data.password?.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (data.password.length < minPasswordLength) {
      newErrors.password = `Mật khẩu phải có ít nhất ${minPasswordLength} ký tự`;
    }
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
        const response = await authService.login(data.email, data.password);
        setUser(transformToStoreUser(response.user));
        setKeyVault(response.keyVault);
        toast.success('Đăng nhập thành công !');
        router.push('/');
        router.refresh();
      } catch (error: unknown) {
        const msg =
          (error as { status?: number })?.status == 401
            ? 'Tài khoản hoặc mật khẩu không đúng !'
            : 'Đăng nhập thất bại do lỗi bất định!';
        toast.error(msg);
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
                alt="ThreshCity Logo"
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
            <Card className="shadow-2xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800 text-center">
                  Đăng nhập vào <span className="text-blue-900">Vibe</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <form ref={formRef} onSubmit={handleSubmit}>
                  <div className="space-y-2 mb-4">
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      onBlur={() => handleFieldBlur('email')}
                      className={`h-12 text-base ${
                        errors.email
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : ''
                      }`}
                    />
                    {errors.email && (
                      <Alert variant="destructive" className="py-1 border-none">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {errors.email}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu"
                        onBlur={() => handleFieldBlur('password')}
                        className={`h-12 pr-10 text-base ${
                          errors.password
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : ''
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <Alert variant="destructive" className="py-1 border-none">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {errors.password}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-lg font-semibold cursor-pointer bg-blue-500 hover:bg-blue-600 mb-4"
                    size="lg"
                  >
                    {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </form>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium p-0 h-auto"
                    asChild
                  >
                    <Link href="/forgot-password">Quên mật khẩu?</Link>
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="text-center">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-8 h-12 bg-green-500 hover:bg-green-600 text-white font-semibold text-base"
                    asChild
                  >
                    <Link href={'/register'}>Tạo tài khoản mới</Link>
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

export default LoginForm;
