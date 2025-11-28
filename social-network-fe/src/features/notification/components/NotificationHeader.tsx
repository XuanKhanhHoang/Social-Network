import { Button } from '@/components/ui/button';
import { CheckCheck, Bell } from 'lucide-react';
import { useMarkAllAsReadMutation } from '../hooks/useNotifications';

export const NotificationHeader = () => {
  const { mutate: markAllAsRead, isPending } = useMarkAllAsReadMutation();

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <h1 className="text-lg font-semibold tracking-tight">Thông báo</h1>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => markAllAsRead()}
        disabled={isPending}
        className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
      >
        <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
        Đánh dấu đã đọc
      </Button>
    </div>
  );
};
