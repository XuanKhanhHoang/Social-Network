'use client';
import { useInfiniteHomeFeed } from '@/features/post/hooks/usePost';
import PostList from '../list/List';

function HomeFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteHomeFeed({});

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <PostList
      posts={posts}
      fetchNextPage={fetchNextPage}
      hasNextPage={!!hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isPending={isPending}
    />
  );
}

export default HomeFeed;
