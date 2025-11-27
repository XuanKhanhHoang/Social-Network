import { Button } from '@/components/ui/button';
import {
  useCancelFriendRequest,
  useSentRequests,
} from '@/features/friendship/hooks/useFriendship';
import FriendCard from '../cards/FriendCard';

export default function SentRequestList({
  onSeeAll,
  maxItems,
}: {
  onSeeAll?: () => void;
  maxItems?: number;
}) {
  const { data, isLoading, isError } = useSentRequests();
  const cancelRequest = useCancelFriendRequest();

  if (isLoading) return null;
  if (isError) return null;

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Yêu cầu đang chờ</h2>
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-muted-foreground">Chưa có yêu cầu nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Yêu cầu đang chờ</h2>
        <Button variant="link" onClick={onSeeAll}>
          Xem tất cả
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.data.slice(0, maxItems).map((request) => (
          <FriendCard
            key={request.id}
            user={request.recipient}
            actions={
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => cancelRequest.mutate(request.recipient.id)}
                disabled={cancelRequest.isPending}
              >
                Hủy
              </Button>
            }
          />
        ))}
      </div>
    </div>
  );
}
