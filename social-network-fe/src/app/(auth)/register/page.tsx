'use client';
import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePassword } from '@/lib/utils/validation';
import Link from 'next/link';
import { authService } from '@/services/auth';
import { RegisterDto } from '@/types-define/dtos';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Gender } from '@/lib/constants/enums';
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string[];
  birthDate?: string;
  gender?: string;
}

const RegisterPage = () => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  // Refs để access form values mà không trigger re-render
  const formRef = useRef<HTMLFormElement>(null);

  // Generate days, months, years (move to useMemo để tránh re-create)
  const { days, months, years, currentYear } = useMemo(() => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];
    const minimumAge = 14;
    const currentYear = new Date().getFullYear() - minimumAge;
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    return { days, months, years, currentYear };
  }, []);

  // Function để lấy form data
  const getFormData = (): Record<string, string> => {
    if (!formRef.current) return {};

    const formData = new FormData(formRef.current);
    return Object.fromEntries(formData.entries()) as Record<string, string>;
  };

  const validateForm = (data: Record<string, string>): FormErrors => {
    const newErrors: FormErrors = {};

    // Validate firstName
    if (!data.firstName?.trim()) {
      newErrors.firstName = 'Vui lòng nhập họ';
    } else if (data.firstName.length < 2) {
      newErrors.firstName = 'Họ phải có ít nhất 2 ký tự';
    }

    // Validate lastName
    if (!data.lastName?.trim()) {
      newErrors.lastName = 'Vui lòng nhập tên';
    } else if (data.lastName.length < 2) {
      newErrors.lastName = 'Tên phải có ít nhất 2 ký tự';
    }

    // Validate email
    const emailValidation = validateEmail(data.email || '');
    if (!emailValidation.isValid) newErrors.email = emailValidation?.error;

    // Validate password
    const passwordValidation = validatePassword(data.password || '');
    if (!passwordValidation.isValid)
      newErrors.password = passwordValidation.errors;

    // Validate birth date
    if (!data.day || !data.month || !data.year) {
      newErrors.birthDate = 'Vui lòng chọn ngày sinh đầy đủ';
    }

    // Validate gender
    if (!data.gender) {
      newErrors.gender = 'Vui lòng chọn giới tính';
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
      const registerData: RegisterDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        birthDate: new Date(
          `${data.year}-${data.month}-${data.day}`
        ).toISOString(),
        gender: data.gender as Gender,
      };
      try {
        await authService
          .register(registerData)
          .then(() => {
            toast.success('Đăng kí thành công, vui lòng xác thực !');
            formRef.current?.reset();
            router.push('/register/done?email=' + registerData.email);
          })
          .catch((error) => {
            setIsSubmitting(false);
            const msg =
              error?.status == 409
                ? 'Email đã được sử dụng !'
                : 'Đăng kí thất bại do lỗi bất định!';
            toast.error(msg);
          });
        setErrors({});
      } catch (error) {
        toast.error('Đăng kí thất bại do lỗi bất định !');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="flex min-h-screen lg:flex-row flex-col">
        {/* Left Side - Brand and Description */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-lg">
            <div className="mb-6">
              <img src="logo.png" alt="ThreshCity Logo" className="h-36" />
            </div>
            <p className="text-gray-700 text-lg font-semibold lg:font-normal lg:text-2xl leading-relaxed">
              ThreshCity giúp bạn kết nối và chia sẻ với mọi người trong cuộc
              sống.
            </p>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="flex-1 flex items-center justify-center mt-2 lg:mt-0 px-8">
          <div className="w-full max-w-md mt-16">
            <Card className="shadow-2xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800 text-center">
                  Tạo tài khoản mới
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Nhanh chóng và dễ dàng.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <form ref={formRef} onSubmit={handleSubmit}>
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="space-y-2">
                      <Input
                        name="firstName"
                        placeholder="Họ"
                        onBlur={() => handleFieldBlur('firstName')}
                        className={`h-12 text-base ${
                          errors.firstName
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : ''
                        }`}
                      />
                      {errors.firstName && (
                        <Alert
                          variant="destructive"
                          className="py-1 border-none"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {errors.firstName}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Input
                        name="lastName"
                        placeholder="Tên"
                        onBlur={() => handleFieldBlur('lastName')}
                        className={`h-12 text-base ${
                          errors.lastName
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : ''
                        }`}
                      />
                      {errors.lastName && (
                        <Alert
                          variant="destructive"
                          className="py-1 border-none"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {errors.lastName}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  {/* Email Input */}
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

                  {/* Password Input */}
                  <div className="space-y-2 mb-4">
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu mới"
                        onBlur={() => handleFieldBlur('password')}
                        className={`h-12 text-base ${
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
                    {errors.password &&
                      errors.password.length > 0 &&
                      errors.password.map((error, index) => (
                        <Alert
                          variant="destructive"
                          className="py-1 border-none"
                          key={index}
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {error}
                          </AlertDescription>
                        </Alert>
                      ))}
                  </div>

                  {/* Birth Date */}
                  <div className="space-y-2 mb-4">
                    <Label className="text-gray-700 text-sm font-medium">
                      Ngày sinh
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        name="day"
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue=""
                        onChange={() => handleFieldBlur('birthDate')}
                      >
                        <option value="" disabled>
                          Ngày
                        </option>
                        {days.map((day) => (
                          <option key={day} value={day.toString()}>
                            {day}
                          </option>
                        ))}
                      </select>

                      <select
                        name="month"
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue=""
                        onChange={() => handleFieldBlur('birthDate')}
                      >
                        <option value="" disabled>
                          Tháng
                        </option>
                        {months.map((month, index) => (
                          <option key={index} value={(index + 1).toString()}>
                            {month}
                          </option>
                        ))}
                      </select>

                      <select
                        name="year"
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue=""
                        onChange={() => handleFieldBlur('birthDate')}
                      >
                        <option value="" disabled>
                          Năm
                        </option>
                        {years.map((year) => (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.birthDate && (
                      <Alert variant="destructive" className="py-1 border-none">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {errors.birthDate}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2 mb-4">
                    <Label className="text-gray-700 text-sm font-medium">
                      Giới tính
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2 border border-gray-300 rounded-md p-2 bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          onChange={() => handleFieldBlur('gender')}
                          className="text-primary"
                        />
                        <span className="text-sm">Nữ</span>
                      </label>
                      <label className="flex items-center space-x-2 border border-gray-300 rounded-md p-2 bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          onChange={() => handleFieldBlur('gender')}
                          className="text-primary"
                        />
                        <span className="text-sm">Nam</span>
                      </label>
                    </div>
                    {errors.gender && (
                      <Alert variant="destructive" className="py-1 border-none">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {errors.gender}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="text-xs text-gray-500 leading-relaxed mb-4">
                    Bằng cách nhấp vào Đăng ký, bạn đồng ý với{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Điều khoản
                    </a>
                    ,{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Chính sách quyền riêng tư
                    </a>{' '}
                    và{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Chính sách cookie
                    </a>{' '}
                    của chúng tôi.
                  </div>

                  {/* Register Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white mb-4"
                    size="lg"
                  >
                    {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Button>
                </form>

                {/* Separator */}
                <Separator className="my-4" />

                {/* Back to Login */}
                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium p-0 h-auto"
                    asChild
                  >
                    <Link href={'/login'}>Đã có tài khoản?</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="lg: hidden text-center my-8 space-y-4">
              <p className="text-xs text-gray-400">KTH - KhanhPoPo © 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer for Desktop */}
      <div className="hidden lg:block mt-3 w-full bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-8">
          <p className="text-xs text-gray-400 text-center">
            KTH - KhanhPoPo © 2025
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
