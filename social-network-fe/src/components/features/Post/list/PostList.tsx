'use client';
import PostItem from './PostItem';
import { useInfinitePosts } from '@/hooks/queries/usePost';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import PostItemSkeleton from './PostItemSkeleton';

function PostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfinitePosts();
  const posts = data?.pages.flatMap((page) => page.data) ?? [];
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <div key={post._id} ref={index === posts.length - 3 ? ref : null}>
          <PostItem post={post} />
        </div>
      ))}
      {isPending && <PostItemSkeleton count={2} />}
      {isFetchingNextPage && <PostItemSkeleton />}
    </div>
  );
}

export default PostList;
