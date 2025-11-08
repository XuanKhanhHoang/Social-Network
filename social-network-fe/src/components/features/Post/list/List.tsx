'use client';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfinitePosts } from '@/hooks/post/usePost';
import SkeletonPostItems from './SkeletonItems';
import PostItem from './Item';
import { transformToPostWithTopComment } from '@/lib/interfaces/post';

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
          <PostItem post={transformToPostWithTopComment(post)} />
        </div>
      ))}
      {isPending && <SkeletonPostItems count={2} />}
      {isFetchingNextPage && <SkeletonPostItems />}
    </div>
  );
}

export default PostList;
