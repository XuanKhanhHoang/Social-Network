'use client';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import SkeletonPostItems from './SkeletonItems';
import PostItem from './Item';
import { transformToPostWithTopComment } from '@/features/post/types/post';
import { PostWithTopCommentDto } from '@/features/post/services/post.dto';

interface PostListProps {
  posts: PostWithTopCommentDto[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
}

function PostList({
  posts,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isPending,
}: PostListProps) {
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
