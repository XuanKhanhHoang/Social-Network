'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CalendarIcon,
  Save,
  Shield,
  User,
  Smartphone,
  Mail,
  AtSign,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useUpdateAccount } from '@/features/user/hooks/useUser';
import { Gender, VisibilityPrivacy } from '@/lib/constants/enums';
import { useStore } from '@/store';
import { StoreUser } from '@/features/auth/store/authSlice';
import { UserAccount } from '@/features/user/types';

const accountFormSchema = z.object({
  firstName: z.string().min(1, 'Họ không được để trống'),
  lastName: z.string().min(1, 'Tên không được để trống'),
  phoneNumber: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  gender: z.enum(Gender),
  birthDate: z.date({ error: 'Vui lòng chọn ngày sinh' }),
  privacy: z.object({
    work: z.enum(VisibilityPrivacy),
    currentLocation: z.enum(VisibilityPrivacy),
    friendList: z.enum([VisibilityPrivacy.FRIENDS, VisibilityPrivacy.PRIVATE]),
    provinceCode: z.enum(VisibilityPrivacy),
    friendCount: z.enum(VisibilityPrivacy),
  }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

const getPrivacyValue = (val: unknown, fallback: VisibilityPrivacy) => {
  if (Object.values(VisibilityPrivacy).includes(val as VisibilityPrivacy)) {
    return val as VisibilityPrivacy;
  }
  return fallback;
};

export default function AccountSettingsForm({
  initialData,
}: {
  initialData: UserAccount;
}) {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const updateAccount = useUpdateAccount(user?.username || '');

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      phoneNumber: initialData.phoneNumber || '',
      gender: initialData.gender || Gender.Male,
      birthDate: initialData.birthDate
        ? new Date(initialData.birthDate)
        : new Date(),
      privacy: {
        work: getPrivacyValue(
          initialData.privacy?.work,
          VisibilityPrivacy.PUBLIC
        ),
        currentLocation: getPrivacyValue(
          initialData.privacy?.currentLocation,
          VisibilityPrivacy.PUBLIC
        ),
        friendList: getPrivacyValue(
          initialData.privacy?.friendList,
          VisibilityPrivacy.FRIENDS
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as unknown as any,
        provinceCode: getPrivacyValue(
          initialData.privacy?.provinceCode,
          VisibilityPrivacy.FRIENDS
        ),
        friendCount: getPrivacyValue(
          initialData.privacy?.friendCount,
          VisibilityPrivacy.FRIENDS
        ),
      },
    },
  });

  const onSubmit = (data: AccountFormValues) => {
    updateAccount.mutate(
      {
        ...data,
        phoneNumber: data.phoneNumber === '' ? null : data.phoneNumber,
      },
      {
        onSuccess: (r) => {
          toast.success('Cập nhật thông tin thành công');
          setUser({
            ...user,
            firstName: r.firstName || user?.firstName,
            lastName: r.lastName || user?.lastName,
          } as StoreUser);
          form.reset(data);
        },
        onError: () => {
          toast.error('Cập nhật thất bại. Vui lòng thử lại.');
        },
      }
    );
  };

  const privacyFields = [
    {
      name: 'privacy.friendList',
      label: 'Danh sách bạn bè',
      desc: 'Ai có thể xem danh sách bạn bè của bạn?',
    },
    {
      name: 'privacy.currentLocation',
      label: 'Nơi sống',
      desc: 'Hiển thị nơi sống trên trang cá nhân cho ai?',
    },
    {
      name: 'privacy.work',
      label: 'Công việc',
      desc: 'Hiển thị thông tin nơi làm việc cho ai?',
    },
    {
      name: 'privacy.provinceCode',
      label: 'Tỉnh/Thành phố',
      desc: 'Hiển thị tỉnh/thành phố cho ai?',
    },
    {
      name: 'privacy.friendCount',
      label: 'Số lượng bạn bè',
      desc: 'Hiển thị số lượng bạn bè cho ai?',
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Thông tin cơ bản
            </CardTitle>
            <CardDescription>
              Thông tin định danh của bạn trên hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-muted-foreground" /> Username
                </span>
                <div className="text-sm text-muted-foreground font-mono">
                  @{initialData.username}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" /> Email
                </span>
                <div className="text-sm text-muted-foreground">
                  {initialData.email}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn" {...field} />
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
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày sinh</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: vi })
                            ) : (
                              <span>Chọn ngày sinh</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          fromYear={1950}
                          toYear={new Date().getFullYear()}
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Gender.Male}>Nam</SelectItem>
                        <SelectItem value={Gender.Female}>Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-500" /> Thông tin liên
              hệ
            </CardTitle>
            <CardDescription>
              Số điện thoại giúp tăng cường bảo mật cho tài khoản.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="+84..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" /> Quyền riêng tư
            </CardTitle>
            <CardDescription>
              Kiểm soát ai có thể nhìn thấy các thông tin bổ sung của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {privacyFields.map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name={item.name as any}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{item.label}</FormLabel>
                      <FormDescription>{item.desc}</FormDescription>
                    </div>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {item.name !== 'privacy.friendList' && (
                            <SelectItem value={VisibilityPrivacy.PUBLIC}>
                              Công khai
                            </SelectItem>
                          )}
                          <SelectItem value={VisibilityPrivacy.FRIENDS}>
                            Bạn bè
                          </SelectItem>
                          <SelectItem value={VisibilityPrivacy.PRIVATE}>
                            Chỉ mình tôi
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={updateAccount.isPending}
          >
            Khôi phục
          </Button>
          <Button
            type="submit"
            className="min-w-[140px]"
            disabled={updateAccount.isPending}
          >
            {updateAccount.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
