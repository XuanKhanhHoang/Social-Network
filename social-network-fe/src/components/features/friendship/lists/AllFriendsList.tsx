import React, { useEffect, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFriends, useUnfriend } from '@/hooks/friendship/useFriendship';
import { UserSummaryDto } from '@/lib/dtos/user';
import { useStore } from '@/store';
import { UserMinus, Search } from 'lucide-react';
import FriendCard from '../cards/FriendCard';
import { debounce } from 'lodash';
import { Skeleton } from '@/components/ui/skeleton';

export default function AllFriendsList() {
  const { ref, inView } = useInView();
  const user = useStore((state) => state.user);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
    }, 500),
    []
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    handleSearch(e.target.value);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    status,
    isFetchingNextPage,
    isFetching,
  } = useFriends(user?.username, debouncedSearch);
  const unfriend = useUnfriend();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleUnfriend = (friendId: string) => {
    unfriend.mutate(friendId);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Tất cả bạn bè</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bạn bè..."
            className="pl-8"
            value={search}
            onChange={onSearchChange}
          />
        </div>
      </div>

      {status === 'error' ? (
        <div>Có lỗi xảy ra</div>
      ) : status === 'pending' ||
        (isFetching && !isFetchingNextPage && !data?.pages[0].data.length) ? (
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
          <p className="text-muted-foreground">
            {debouncedSearch
              ? 'Không tìm thấy bạn bè nào'
              : 'Bạn chưa có bạn bè nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.pages.map((page, i) => (
            <React.Fragment key={i}>
              {page.data.map((friend: UserSummaryDto) => (
                <FriendCard
                  key={friend._id}
                  user={friend}
                  actions={
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleUnfriend(friend._id)}
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Hủy kết bạn
                    </Button>
                  }
                />
              ))}
            </React.Fragment>
          ))}
          <div ref={ref} className="h-4" />
        </div>
      )}
    </div>
  );
}
