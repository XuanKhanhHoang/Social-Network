'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { useMutation } from '@tanstack/react-query';
import { ApiClient } from '@/services/api';

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu cũ'),
    newPassword: z
      .string()
      .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
      .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
      .regex(/[0-9]/, 'Cần ít nhất 1 số'),
    confirmNewPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm() {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormValues) => {
      return ApiClient.patch('/auth/change-password', data);
    },
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công');
      form.reset();
    },
    onError: (error: { status: number }) => {
      if (error.status === 403) {
        toast.error('Mật khẩu cũ không chính xác');
        return;
      }
      if (error.status === 409) {
        toast.error('Mật khẩu cũ không được trùng với mật khẩu mới');
        return;
      }
      if (error.status === 400) {
        toast.error('Vui lòng kiểm tra lại thông tin');
        return;
      }
      toast.error('Đổi mật khẩu thất bại. Vui lòng thử lại.');
    },
  });

  const onSubmit = (data: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-orange-500" /> Đổi mật khẩu
            </CardTitle>
            <CardDescription>
              Đảm bảo tài khoản của bạn được bảo mật bằng cách sử dụng mật khẩu
              mạnh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu cũ</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Nhập mật khẩu cũ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Nhập mật khẩu mới"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Nhập lại mật khẩu mới"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <div className="flex justify-end gap-4 p-6 pt-0">
            <Button
              type="submit"
              className="min-w-[140px]"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
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
        </Card>
      </form>
    </Form>
  );
}
