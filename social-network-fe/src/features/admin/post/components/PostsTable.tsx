'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Trash2,
  RotateCcw,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import { AdminPost, PostStatus } from '../types/post.types';

const statusLabels: Record<PostStatus, string> = {
  active: 'Hoạt động',
  deleted: 'Đã xóa',
  archived: 'Lưu trữ',
};

const statusColors: Record<PostStatus, string> = {
  active: 'bg-green-100 text-green-800',
  deleted: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
};

const formatExactTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

interface PostsTableProps {
  data: AdminPost[] | undefined;
  isLoading: boolean;
  page: number;
  onPreview: (post: AdminPost) => void;
  onDelete: (post: AdminPost) => void;
  onRestore: (post: AdminPost) => void;
}

export function PostsTable({
  data,
  isLoading,
  page,
  onPreview,
  onDelete,
  onRestore,
}: PostsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Tác giả</TableHead>
          <TableHead className="max-w-xs">Nội dung</TableHead>
          <TableHead>Tương tác</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Thời gian</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              Đang tải...
            </TableCell>
          </TableRow>
        ) : data?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
              Không có bài viết nào
            </TableCell>
          </TableRow>
        ) : (
          data?.map((post, index) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">
                {(page - 1) * 10 + index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                    {post.author.firstName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {post.author.lastName} {post.author.firstName}
                    </p>
                    <p className="text-xs text-gray-500">
                      @{post.author.username}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="text-sm truncate">
                  {post.plainText || '(Không có nội dung văn bản)'}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {post.reactionsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {post.commentsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="h-3.5 w-3.5" />
                    {post.sharesCount}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={statusColors[post.status]}
                  variant="secondary"
                >
                  {statusLabels[post.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                <div>{formatExactTime(post.createdAt)}</div>
                {post.deletedAt && (
                  <div className="text-xs text-red-600">
                    Xóa: {formatExactTime(post.deletedAt)}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onPreview(post)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Xem nội dung
                    </DropdownMenuItem>
                    {post.status === 'active' && (
                      <DropdownMenuItem
                        onClick={() => onDelete(post)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa bài viết
                      </DropdownMenuItem>
                    )}
                    {post.status === 'deleted' && (
                      <DropdownMenuItem
                        onClick={() => onRestore(post)}
                        className="text-green-600 focus:text-green-600"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Khôi phục
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
