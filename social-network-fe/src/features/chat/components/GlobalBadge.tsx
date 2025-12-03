import { useUnreadStatus } from '../hooks/useUnreadStatus';
import { cn } from '@/lib/utils';

interface GlobalBadgeProps {
  className?: string;
}

export const GlobalBadge = ({ className }: GlobalBadgeProps) => {
  const { data: hasUnread } = useUnreadStatus();

  if (!hasUnread) return null;

  return (
    <div
      className={cn(
        'absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background',
        className
      )}
    />
  );
};
