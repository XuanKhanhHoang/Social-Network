import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface LoginPromptProps {
  name: string;
}

export function LoginPrompt({ name }: LoginPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-lg border">
      <Lock size={48} className="text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold">Trang cá nhân riêng tư</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Vui lòng đăng nhập để xem thông tin chi tiết, bài viết và các hoạt động
        khác của {name}.
      </p>
      <Link href="/login" passHref>
        <Button className="mt-6">Đăng nhập</Button>
      </Link>
    </div>
  );
}
