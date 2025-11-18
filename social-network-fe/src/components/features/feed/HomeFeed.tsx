'use client';
import { useInfiniteHomeFeed } from '@/hooks/post/usePost';
import PostList from '../post/list/List';

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
