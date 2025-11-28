import { useInView } from 'react-intersection-observer';
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';
import { NotificationItem } from './NotificationItem';
import { Loader2, BellOff } from 'lucide-react';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationSync } from '../hooks/useNotificationSync';

const NotificationSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-border/40">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-3 w-[40%]" />
    </div>
  </div>
);

export const NotificationList = () => {
  const {
    data: notifications,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    isFetchingNextPage,
  } = useNotificationSync();
  const { handleNavigate } = useNotificationNavigation();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  console.log(notifications);
  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(5)].map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <p>Có lỗi xảy ra khi tải thông báo.</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground animate-in fade-in-50">
        <div className="bg-muted p-4 rounded-full mb-4">
          <BellOff className="h-8 w-8 opacity-50" />
        </div>
        <p className="font-medium">Không có thông báo nào</p>
        <p className="text-sm opacity-70">
          Bạn đã cập nhật tất cả thông tin mới nhất
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={handleNavigate}
          />
        ))}

        <div ref={ref} className="py-4">
          {isFetchingNextPage && (
            <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tải thêm...</span>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
