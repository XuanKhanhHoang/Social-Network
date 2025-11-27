import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Province } from '@/lib/interfaces';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ProvinceSelect } from '../ProvineSelect';

interface ProfileFormValues {
  bio?: string;
  work?: string;
  location?: string;
  provinceCode?: number | null;
}

interface BioCardProps {
  control: Control<ProfileFormValues>;
  provinces: Province[];
  isLoadingProvinces?: boolean;
}

export function BioCard({
  control,
  provinces,
  isLoadingProvinces,
}: BioCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin chi tiết</CardTitle>
        <CardDescription>
          Thông tin này sẽ được hiển thị trên trang cá nhân của bạn dựa vào cài
          đặt quyền riêng tư của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiểu sử</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nói gì đó về bạn..."
                  rows={4}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <div className="text-sm text-muted-foreground text-right">
                {field.value?.length || 0}/500 ký tự
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="work"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nơi làm việc</FormLabel>
                <FormControl>
                  <Input placeholder="Làm việc tại..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nơi sống</FormLabel>
                <FormControl>
                  <Input placeholder="Sống tại..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="provinceCode"
          render={({ field }) => (
            <FormItem>
              <ProvinceSelect
                isLoading={isLoadingProvinces}
                value={field.value}
                onChange={field.onChange}
                provinces={provinces || []}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
