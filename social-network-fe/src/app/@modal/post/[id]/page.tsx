'use client';
import PostDetail from '@/components/features/Post/detail/PostDetail';
import { usePost } from '@/hooks/post/usePost';
import { useParams, useSearchParams } from 'next/navigation';

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const mediaIndex = Number(searchParams.get('m') ?? 0);
  const { data: post, isPending, isError } = usePost(id);
  return (
    <PostDetail
      post={post}
      initialMediaIndex={mediaIndex}
      isError={isError}
      isPending={isPending}
    />
  );
}
