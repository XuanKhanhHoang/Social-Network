'use client';
import PostDetail from '@/components/features/post/detail/Main';
import { usePost } from '@/hooks/post/usePost';
import { transformToPostWithMyReaction } from '@/lib/interfaces/post';
import { useParams, useSearchParams } from 'next/navigation';

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const mediaIndex = Number(searchParams.get('m') ?? 0);
  const { data: post, isPending, isError } = usePost(id);
  console.log(post?.media);
  return (
    <PostDetail
      post={post ? transformToPostWithMyReaction(post) : undefined}
      initialMediaIndex={mediaIndex}
      isError={isError}
      isPending={isPending}
    />
  );
}
