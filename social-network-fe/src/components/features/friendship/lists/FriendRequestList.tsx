import { Button } from '@/components/ui/button';
import {
  useAcceptFriendRequest,
  useDenyFriendRequest,
  useFriendRequests,
} from '@/hooks/friendship/useFriendship';
import FriendCard from '../cards/FriendCard';

export default function FriendRequestList({
  onSeeAll,
  maxItems,
}: {
  onSeeAll?: () => void;
  maxItems?: number;
}) {
  const { data, isLoading, isError } = useFriendRequests();
  const acceptRequest = useAcceptFriendRequest();
  const denyRequest = useDenyFriendRequest();

  console.log(data);
  if (isLoading) return <div>Đang tải...</div>;
  if (isError) return <div>Có lỗi xảy ra</div>;

  if (!data || !data?.data || data.data.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Lời mời kết bạn</h2>
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-muted-foreground">Chưa có lời mời kết bạn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Lời mời kết bạn ({data.data.length})
        </h2>
        <Button variant="link" onClick={onSeeAll}>
          Xem tất cả
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.data.slice(0, maxItems).map((request) => (
          <FriendCard
            key={request._id}
            user={request}
            actions={
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    acceptRequest.mutate({
                      requesterId: request._id,
                    })
                  }
                  disabled={acceptRequest.isPending}
                >
                  Chấp nhận
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => denyRequest.mutate(request._id)}
                  disabled={denyRequest.isPending}
                >
                  Từ chối
                </Button>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
