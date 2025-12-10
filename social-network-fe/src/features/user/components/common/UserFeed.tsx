'use client';
import PostCreator from '@/features/post/components/create/PostCreator';
import { useInfiniteUserPosts } from '@/features/post/hooks/usePost';
import PostList from '@/features/post/components/list/List';
import { useStore } from '@/store';

interface UserProfileFeedProps {
  username: string;
  isOwner?: boolean;
}

export default function UserProfileFeed({
  username,
  isOwner = false,
}: UserProfileFeedProps) {
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

  const showPostCreator = !!userAuth && isOwner;

  return (
    <>
      {showPostCreator && <PostCreator />}
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
