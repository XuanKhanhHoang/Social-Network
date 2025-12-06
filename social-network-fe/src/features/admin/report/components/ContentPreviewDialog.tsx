'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExpandableContent } from '@/components/ui/ExpandableContent';
import {
  Loader2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ReportTargetDto, ReportTargetMedia } from '../services/report.dto';
import { formatDisplayTime } from '@/lib/utils/time';
import { useImageViewer } from '@/components/provider/ImageViewerProvider';
import Image from 'next/image';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { Emoji } from '@/lib/editor/emoji-node';

const MediaItemWithCaption = ({
  media,
  onImageClick,
}: {
  media: ReportTargetMedia;
  onImageClick?: (url: string) => void;
}) => {
  const [showCaption, setShowCaption] = useState(false);

  return (
    <div className="space-y-1">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {media.mediaType === 'video' ? (
          <video
            src={media.url}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={media.url}
            alt="Media"
            fill
            className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageClick?.(media.url)}
          />
        )}
      </div>
      {media.caption && (
        <div>
          <button
            onClick={() => setShowCaption(!showCaption)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            {showCaption ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Caption
          </button>
          {showCaption && (
            <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded">
              {media.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface ContentPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  data: ReportTargetDto | undefined;
  isLoading: boolean;
}

export function ContentPreviewDialog({
  open,
  onClose,
  data,
  isLoading,
}: ContentPreviewDialogProps) {
  const { open: openImage } = useImageViewer();

  const contentHtml = data?.content
    ? generateHTML(data.content, [
        StarterKit,
        TextStyle,
        Color,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Emoji,
      ])
    : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Nội dung {data?.targetType === 'post' ? 'bài viết' : 'bình luận'}
          </DialogTitle>
          <DialogDescription>
            Xem chi tiết nội dung bị báo cáo
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : data?.isDeleted ? (
          <div className="py-8 text-center text-gray-500">
            <p>Nội dung đã bị xóa</p>
          </div>
        ) : (
          data && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Author Info */}
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                    {data.author.firstName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {data.author.lastName} {data.author.firstName}
                    </p>
                    <p className="text-xs text-gray-500">
                      @{data.author.username} •{' '}
                      {formatDisplayTime(data.createdAt)}
                    </p>
                  </div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    ID: {data.targetId}
                  </code>
                </div>

                {/* Content */}
                {contentHtml && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ExpandableContent
                      html={contentHtml}
                      maxLines={5}
                      className="prose prose-sm max-w-none [&_p]:m-0 [&_p]:leading-relaxed"
                      expandLabel="Xem thêm"
                      collapseLabel="Thu gọn"
                    />
                  </div>
                )}

                {/* Media */}
                {data.media && data.media.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <ImageIcon className="h-4 w-4" />
                      <span>Media đính kèm ({data.media.length})</span>
                    </div>
                    <ScrollArea className="max-h-[300px]">
                      <div className="grid grid-cols-2 gap-3 pr-2">
                        {data.media.map((m, idx) => (
                          <MediaItemWithCaption
                            key={idx}
                            media={m}
                            onImageClick={(url) =>
                              openImage({ imgId: `media-${idx}`, url })
                            }
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </ScrollArea>
          )
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
