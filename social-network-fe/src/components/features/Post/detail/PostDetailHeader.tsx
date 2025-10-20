import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils/time';
import { Post } from '@/lib/dtos';
import { MoreHorizontal } from 'lucide-react';

export function PostDetailHeader({ post }: { post: Post }) {
  return (
    <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={post.author.avatar} />
          <AvatarFallback>
            {post.author.firstName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-sm">{post.author.firstName}</span>
          <span className="text-xs text-gray-500">
            {timeAgo(post.createdAt)}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreHorizontal size={16} />
      </Button>
    </div>
  );
}
