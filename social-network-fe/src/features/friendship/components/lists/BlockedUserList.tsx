import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { useBlockedUsers } from '@/features/friendship/hooks/useFriendship';
import { UserSummaryDto } from '@/features/user/services/user.dto';
import FriendCard from '../cards/FriendCard';

export default function BlockedUserList() {
  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage, status } = useBlockedUsers();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (status === 'pending') return <div>Đang tải danh sách chặn...</div>;
  if (status === 'error') return <div>Có lỗi xảy ra</div>;

  if (!data?.pages[0].data.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Danh sách chặn</h2>
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-muted-foreground">Bạn chưa chặn ai</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Danh sách chặn</h2>
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Bỏ chặn
                    </Button>
                  }
                />
              );
            })}
          </React.Fragment>
        ))}
        <div ref={ref} className="h-4" />
      </div>
    </div>
  );
}
