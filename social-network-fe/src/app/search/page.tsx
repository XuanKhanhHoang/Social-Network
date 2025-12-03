'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { SearchTabs } from '@/features/search/components/SearchTabs';
import { UserSearchCard } from '@/features/search/components/UserSearchCard';
import PostList from '@/features/post/components/list/List';
import { useSearchUsers } from '@/features/search/hooks/useSearchUsers';
import { useSearchPosts } from '@/features/search/hooks/useSearchPosts';
import { SearchTab } from '@/features/search/types';
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get('type') as SearchTab) || 'all';
  const initialQuery = searchParams.get('key') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    const params = new URLSearchParams(searchParams);
    params.set('key', searchTerm.trim());
    router.push(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams);
    params.delete('key');
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const userLimit = type === 'all' ? 3 : 12;
  const postLimit = 12;

  const {
    data: usersData,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasNextUsers,
    isFetchingNextPage: isFetchingNextUsers,
    isLoading: isLoadingUsers,
  } = useSearchUsers(
    initialQuery,
    type === 'all' || type === 'people',
    userLimit
  );

  const {
    data: postsData,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
    isLoading: isLoadingPosts,
  } = useSearchPosts(
    initialQuery,
    type === 'all' || type === 'posts',
    postLimit
  );

  const users = usersData?.pages.flatMap((page) => page.data) || [];
  const posts = postsData?.pages.flatMap((page) => page.data) || [];

  const showEmptyState = !initialQuery;
  const showNoResults =
    initialQuery &&
    !isLoadingUsers &&
    !isLoadingPosts &&
    users.length === 0 &&
    posts.length === 0;

  return (
    <div className="container max-w-[720px] mx-auto py-6 px-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm trên Facebook..."
          className="pl-9 pr-9 bg-gray-100 border-none rounded-md h-10"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <SearchTabs />

      <div className="space-y-8 mt-6">
        {showEmptyState && (
          <div className="text-center text-gray-500 py-20">
            <h3 className="text-lg font-semibold">Hãy tìm kiếm gì đó</h3>
            <p>Nhập từ khóa để tìm kiếm bạn bè và bài viết</p>
          </div>
        )}

        {!showEmptyState && (
          <>
            {/* Users Section */}
            {(type === 'all' || type === 'people') && (
              <div className="space-y-4">
                {type === 'all' && (users.length > 0 || isLoadingUsers) && (
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Mọi người</h2>
                    <Button
                      variant="link"
                      className="text-blue-500 hover:no-underline"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('type', 'people');
                        router.push(`/search?${params.toString()}`);
                      }}
                    >
                      Xem tất cả
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  {isLoadingUsers && users.length === 0
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 p-4 bg-white rounded-md border border-gray-100"
                        >
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                          </div>
                        </div>
                      ))
                    : users.map((user) => (
                        <UserSearchCard key={user._id} user={user} />
                      ))}

                  {type === 'people' && hasNextUsers && (
                    <div
                      ref={(node) => {
                        if (node && hasNextUsers && !isFetchingNextUsers) {
                          fetchNextUsers();
                        }
                      }}
                      className="h-4"
                    />
                  )}
                  {type === 'people' && isFetchingNextUsers && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 p-4 bg-white rounded-md border border-gray-100">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(type === 'all' || type === 'posts') && (
              <div className="space-y-4">
                {type === 'all' && (posts.length > 0 || isLoadingPosts) && (
                  <h2 className="text-xl font-bold">Bài viết</h2>
                )}

                {isLoadingPosts && posts.length === 0 ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="space-y-3 p-4 bg-white rounded-md border border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                      </div>
                      <Skeleton className="h-32 w-full rounded-md" />
                    </div>
                  ))
                ) : (
                  <PostList
                    posts={posts}
                    isPending={isLoadingPosts}
                    fetchNextPage={fetchNextPosts}
                    hasNextPage={hasNextPosts}
                    isFetchingNextPage={isFetchingNextPosts}
                  />
                )}
              </div>
            )}

            {showNoResults && (
              <div className="text-center text-gray-500 py-10">
                Không tìm thấy kết quả nào cho &quot;{initialQuery}&quot;
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
