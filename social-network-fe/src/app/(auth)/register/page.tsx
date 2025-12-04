'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { authService } from '@/features/auth/services/auth.service';
import { RegisterRequestDto } from '@/lib/dtos';
import { Gender } from '@/lib/constants/enums';
import {
  createIdentity,
  createKeyVault,
} from '@/features/crypto/utils/cryptions';
import { keyStorage } from '@/features/crypto/services/key-storage.service';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Họ phải có ít nhất 2 ký tự'),
    lastName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z
      .string()
      .min(6, 'Mật khẩu tối thiểu 6 ký tự')
      .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
      .regex(/[0-9]/, 'Cần ít nhất 1 số'),
    gender: z.enum(Gender),
    day: z.string().min(1, 'Chọn ngày'),
    month: z.string().min(1, 'Chọn tháng'),
    year: z.string().min(1, 'Chọn năm'),
  })
  .refine(
    (data) => {
      const date = new Date(`${data.year}-${data.month}-${data.day}`);
      return (
        !isNaN(date.getTime()) &&
        date.getDate() === Number(data.day) &&
        date.getMonth() + 1 === Number(data.month)
      );
    },
    {
      message: 'Ngày sinh không hợp lệ',
      path: ['day'],
    }
  );

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [pendingData, setPendingData] = useState<RegisterRequestDto | null>(
    null
  );

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      day: '',
      month: '',
      year: '',
      gender: undefined,
    },
  });

  const { days, months, years } = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return {
      days: Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
      months: Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `Tháng ${i + 1}`,
      })),
      years: Array.from({ length: 100 }, (_, i) =>
        (currentYear - 14 - i).toString()
      ),
    };
  }, []);

  const onFormSubmit = (data: RegisterFormValues) => {
    const baseData: RegisterRequestDto = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      birthDate: new Date(
        `${data.year}-${data.month}-${data.day}`
      ).toISOString(),
      gender: data.gender,
      publicKey: '',
      keyVault: { salt: '', iv: '', ciphertext: '' },
    };

    setPendingData(baseData);
    setShowPinDialog(true);
  };

  const handlePinSubmit = async () => {
    if (pin.length < 6 || !pendingData) return;

    setIsSubmitting(true);
    try {
      const { publicKey, secretKey } = createIdentity();
      const keyVault = await createKeyVault(secretKey, pin);
      const finalData: RegisterRequestDto = {
        ...pendingData,
        publicKey,
        keyVault,
      };
      const response = await authService.register(finalData);
      if (response.user) {
        await keyStorage.saveMySecretKey(secretKey);
      }
      toast.success('Đăng ký thành công!');
      form.reset();
      router.push('/register/done?email=' + finalData.email);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const status = error?.response?.status || error?.status;
      const msg =
        status === 409
          ? 'Email này đã được sử dụng!'
          : 'Đăng ký thất bại. Vui lòng thử lại sau.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setShowPinDialog(false);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      <div className="flex flex-1 lg:flex-row flex-col">
        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <div className="max-w-lg">
            <div className="mb-6">
              <img src="logo.png" alt="Vibe Logo" className="h-28 lg:h-36" />
            </div>
            <p className="text-gray-700 text-lg font-semibold lg:font-normal lg:text-2xl leading-relaxed">
              Vibe - Make your vibe.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 lg:px-8 pb-10">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-none">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center text-gray-800">
                  Tạo tài khoản mới
                </CardTitle>
                <CardDescription className="text-center text-gray-500">
                  Nhanh chóng và dễ dàng.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onFormSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Họ"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Tên"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Email hoặc số điện thoại"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mật khẩu mới"
                                className="h-11 pr-10"
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel className="text-xs text-gray-500 font-normal ml-1">
                        Ngày sinh
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        <FormField
                          control={form.control}
                          name="day"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Ngày" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {days.map((d) => (
                                    <SelectItem key={d} value={d}>
                                      {d}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="month"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Tháng" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                      {m.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Năm" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {years.map((y) => (
                                    <SelectItem key={y} value={y}>
                                      {y}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      {form.formState.errors.day && (
                        <p className="text-[0.8rem] font-medium text-destructive mt-1">
                          {form.formState.errors.day.message}
                        </p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs text-gray-500 font-normal ml-1">
                            Giới tính
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-2"
                            >
                              <FormItem className="flex items-center justify-between space-y-0 border rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50">
                                <FormLabel className="font-normal cursor-pointer flex-1">
                                  Nữ
                                </FormLabel>
                                <FormControl>
                                  <RadioGroupItem value={Gender.Female} />
                                </FormControl>
                              </FormItem>
                              <FormItem className="flex items-center justify-between space-y-0 border rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50">
                                <FormLabel className="font-normal cursor-pointer flex-1">
                                  Nam
                                </FormLabel>
                                <FormControl>
                                  <RadioGroupItem value={Gender.Male} />
                                </FormControl>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 mt-2"
                    >
                      {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                    </Button>
                  </form>
                </Form>

                <Separator className="my-6" />

                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-blue-600 font-semibold"
                    asChild
                  >
                    <Link href="/login">Đã có tài khoản?</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Thiết lập mã PIN bảo mật
            </DialogTitle>
            <DialogDescription className="text-center text-red-500 font-medium bg-red-50 p-2 rounded-md mt-2">
              Quan trọng: Mã PIN này dùng để khôi phục tin nhắn khi bạn đổi
              thiết bị. Nếu quên, bạn sẽ mất toàn bộ tin nhắn.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <span className="text-sm text-gray-500">Nhập 6 chữ số</span>

            <InputOTP
              maxLength={6}
              value={pin}
              onChange={(value) => setPin(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <DialogFooter className="sm:justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPinDialog(false)}
              disabled={isSubmitting}
            >
              Quay lại
            </Button>
            <Button
              type="button"
              onClick={handlePinSubmit}
              disabled={isSubmitting || pin.length < 6}
              className="px-8"
            >
              {isSubmitting ? 'Đang mã hóa...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="hidden lg:block w-full bg-white border-t py-4">
        <div className="container mx-auto text-center">
          <p className="text-xs text-gray-400">KTH - KhanhPoPo © 2025</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
