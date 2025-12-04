'use client';
import { useRef, useState } from 'react';
import { AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateEmail, validatePassword } from '@/lib/utils/validation';
import { adminAuthService } from '@/features/admin/services/admin-auth.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface FormErrors {
  email?: string;
  password?: string;
}

const AdminLoginPage = () => {
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
    const passwordValidation = validatePassword(data.password || '');

    if (!emailValidation.isValid) newErrors.email = emailValidation.error;
    if (!passwordValidation.isValid)
      newErrors.password = passwordValidation.errors[0];

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
        await adminAuthService.login({
          email: data.email,
          password: data.password,
        });
        toast.success('Đăng nhập thành công!');
        router.push('/admin/dashboard');
      } catch (error: unknown) {
        const errorMessage =
          (error as { status?: number })?.status?.toString() === '401'
            ? 'Thông tin đăng nhập không chính xác!'
            : 'Đăng nhập thất bại!';
        toast.error(errorMessage);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-lg font-semibold">Admin Panel</CardTitle>
            <p className="text-gray-500 text-sm">Đăng nhập để quản lý</p>
          </CardHeader>

          <CardContent>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  onBlur={() => handleFieldBlur('email')}
                  className={`h-10 ${errors.email ? 'border-red-500' : ''}`}
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

              <div className="space-y-2">
                <PasswordInput
                  name="password"
                  placeholder="Mật khẩu"
                  onBlur={() => handleFieldBlur('password')}
                  className={`h-10 ${errors.password ? 'border-red-500' : ''}`}
                />
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
                className="w-full h-10 bg-black hover:bg-gray-800"
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-400 text-xs mt-4">
          KTH - KhanhPoPo © 2025
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
