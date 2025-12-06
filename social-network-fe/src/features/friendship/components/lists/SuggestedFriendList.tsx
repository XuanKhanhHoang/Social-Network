import { UserPlus } from 'lucide-react';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { UserSummaryDto } from '@/features/user/services/user.dto';
import {
  useSendFriendRequest,
  useSuggestedFriends,
} from '@/features/friendship/hooks/useFriendship';
import FriendCard from '../cards/FriendCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function SuggestedFriendList({
  onSeeAll,
}: {
  onSeeAll?: () => void;
}) {
  const { ref, inView } = useInView();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isFetching,
  } = useSuggestedFriends();
  const sendRequest = useSendFriendRequest();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bạn bè gợi ý</h2>
        {onSeeAll && (
          <Button variant="link" onClick={onSeeAll}>
            Xem tất cả
          </Button>
        )}
      </div>

      {status === 'error' ? (
        <div>Có lỗi xảy ra</div>
      ) : status === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : !data?.pages[0].data.length ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-muted-foreground">Không có gợi ý nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.pages.map((page, i) => (
            <React.Fragment key={i}>
              {page.data.map((userDto: UserSummaryDto) => {
                const user = {
                  ...userDto,
                  id: userDto._id,
                  fullName: `${userDto.lastName} ${userDto.firstName}`,
                };
                return (
                  <FriendCard
                    key={user.id}
                    user={user}
                    actions={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          sendRequest.mutate({ recipientId: user.id })
                        }
                        disabled={sendRequest.isPending}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Thêm bạn bè
                      </Button>
                    }
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}

      <div ref={ref} className="h-10 flex items-center justify-center w-full">
        {isFetchingNextPage && (
          <div className="text-muted-foreground text-sm">Đang tải thêm...</div>
        )}
      </div>
    </div>
  );
}
