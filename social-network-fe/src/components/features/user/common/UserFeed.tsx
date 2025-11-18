'use client';
import PostCreator from '@/components/features/post/create/Manager';
import { useInfiniteUserPosts } from '@/hooks/post/usePost';
import PostList from '@/components/features/post/list/List';
import { useStore } from '@/store';

export default function UserProfileFeed({ username }: { username: string }) {
  const {
    data: posts,
    isLoading: isLoadingPosts,
    isPending: isPendingPost,
    isError: isErrorPosts,
    fetchNextPage: fetchNextPostsPage,
    hasNextPage: hasNextPagePost,
    isFetchingNextPage: isFetchingNextPagePost,
  } = useInfiniteUserPosts({ username });
  const userAuth = useStore((s) => s.user);
  if (isLoadingPosts) {
    return <div>Đang tải bài viết...</div>;
  }
  if (isErrorPosts) {
    return <div>Lỗi tải bài viết.</div>;
  }
  return (
    <>
      {userAuth && <PostCreator />}
      <PostList
        posts={posts?.pages.flatMap((page) => page.data) ?? []}
        fetchNextPage={fetchNextPostsPage}
        hasNextPage={hasNextPagePost}
        isFetchingNextPage={isFetchingNextPagePost}
        isPending={isPendingPost}
      />
    </>
  );
}
