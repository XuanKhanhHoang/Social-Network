'use client';

import { EditorContent } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, SendHorizontal } from 'lucide-react';
import EmojiButton from '@/components/ui/emoji-button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import MediaUploadItem from '@/features/media/components/uploader/UploadItem';
import {
  useCommentEditor,
  UseCommentEditorProps,
} from '../../hooks/useCommentEditor';

export default function CommentEditor(
  props: UseCommentEditorProps & {
    className?: string;
    variant?: 'minimal' | 'boxed';
    placeholderSize?: 'xs' | 'sm' | 'base' | 'lg';
    allowMedia?: boolean;
  }
) {
  const {
    className,
    variant = 'minimal',
    placeholderSize = 'base',
    allowMedia = true,
  } = props;

  const {
    editor,
    singleMediaItem,
    isSubmitting,
    isDisabled,
    onHookMediaUpload,
    handleRemoveMedia,
    handleSubmit,
    hasUploadingFiles,
  } = useCommentEditor(props);

  if (!editor) return null;

  const placeholderClass = {
    xs: '[&_p.is-editor-empty:first-child::before]:text-xs',
    sm: '[&_p.is-editor-empty:first-child::before]:text-sm',
    base: '[&_p.is-editor-empty:first-child::before]:text-base',
    lg: '[&_p.is-editor-empty:first-child::before]:text-lg',
  }[placeholderSize];

  const containerClasses = cn({
    'bg-gray-100 rounded-md': variant === 'boxed',
    'bg-transparent': variant === 'minimal',
  });

  return (
    <div className={className}>
      <div className={`flex items-center w-full ${containerClasses}`}>
        <div className="flex-1 flex items-center min-w-0">
          <EditorContent
            editor={editor}
            className={cn(
              'flex-1 min-w-0 [&_.ProseMirror]:outline-none [&_.ProseMirror]:py-2 [&_.ProseMirror]:px-3 [&_.ProseMirror]:bg-transparent',
              '[&_.ProseMirror]:break-words',
              placeholderClass
            )}
          />
          <div className="flex items-center justify-end gap-1 pr-2">
            {allowMedia && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                asChild
              >
                <label>
                  <ImagePlus size={16} />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={onHookMediaUpload}
                    disabled={
                      isSubmitting || !!singleMediaItem || hasUploadingFiles
                    }
                    className="hidden"
                  />
                </label>
              </Button>
            )}
            <EmojiButton editor={editor} />
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isDisabled}
          variant="ghost"
          size="sm"
          className="px-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal size={16} />
          )}
        </Button>
      </div>
      {singleMediaItem && (
        <div className="pl-3 pt-2">
          <MediaUploadItem
            handle={{ onRemove: handleRemoveMedia }}
            item={singleMediaItem}
            className={{ container: 'w-24 h-24' }}
          />
        </div>
      )}
    </div>
  );
}
