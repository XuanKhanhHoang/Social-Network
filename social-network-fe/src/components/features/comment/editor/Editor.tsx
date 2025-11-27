'use client';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, JSONContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Emoji } from '@/lib/editor/emoji-node';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, SendHorizontal } from 'lucide-react';
import EmojiButton from '@/components/ui/emoji-button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import _ from 'lodash';
import { MediaItemWithHandlingStatus } from '../../media/type';
import MediaUploadItem from '../../media/uploader/UploadItem';
import { useUpdatePostCache } from '@/features/post/hooks/usePostCache';
import { commentService } from '@/services/comment';
import { useUpdateCommentCache } from '@/features/comment/hooks/useCommentCache';
import { useMediaUpload } from '@/features/media/hooks/useMediaUpload';
export type CommentEditorProps = {
  postId: string;
  parentId?: string;
  data?: {
    content?: JSONContent;
    media?: MediaItemWithHandlingStatus;
    _id: string;
  };
  className?: string;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  allowMedia?: boolean;
  variant?: 'minimal' | 'boxed';
  placeholderSize?: 'xs' | 'sm' | 'base' | 'lg';
};
export default function CommentEditor({
  postId,
  parentId,
  data,
  className,
  mode,
  onSuccess,
  placeholder = 'Thêm bình luận ...',
  autoFocus = false,
  allowMedia = true,
  placeholderSize = 'base',
  variant = 'minimal',
}: CommentEditorProps) {
  const isUpdate = mode === 'edit';

  const {
    media,
    handleMediaUpload: onHookMediaUpload,
    handleMediaChange,
    hasUploadingFiles,
    hasUploadErrors,
  } = useMediaUpload({
    initialMedia: data?.media ? [data.media] : [],
    maxFiles: 1,
  });
  const singleMediaItem = media[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [isPendingDebounce, setIsPendingDebounce] = useState(false);
  const { incrementComments } = useUpdatePostCache();
  const { invalidateRootsComments, invalidateReplies } =
    useUpdateCommentCache();
  const initialData = useRef(data);

  const debouncedUpdate = useMemo(
    () =>
      _.debounce(() => {
        setIsPendingDebounce(false);
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);
  const placeholderClass = {
    xs: '[&_p.is-editor-empty:first-child::before]:text-xs',
    sm: '[&_p.is-editor-empty:first-child::before]:text-sm',
    base: '[&_p.is-editor-empty:first-child::before]:text-base',
    lg: '[&_p.is-editor-empty:first-child::before]:text-lg',
  }[placeholderSize];
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder }), Emoji],
    content: data?.content,
    autofocus: autoFocus,
    immediatelyRender: false,
    onCreate: () => {
      setTimeout(() => setEditorReady(true), 100);
    },
    onUpdate: () => {
      if (editorReady) {
        setIsPendingDebounce(true);
        debouncedUpdate();
      }
    },
  });

  const handleRemoveMedia = useCallback(() => {
    handleMediaChange([], {});
  }, [handleMediaChange]);

  const hasChanges = useMemo(() => {
    if (!isUpdate || !initialData.current || !editorReady || !editor)
      return false;

    const originalData = initialData.current;
    const contentChanged =
      JSON.stringify(editor.getJSON()) !==
      JSON.stringify(originalData.content || '');
    const mediaChanged = singleMediaItem?.id !== originalData.media?.id;
    return contentChanged || mediaChanged;
  }, [isUpdate, singleMediaItem, editorReady, editor]);

  const handleSubmit = async () => {
    if (!editor || isSubmitting) return;

    const content = editor.isEmpty ? undefined : editor.getJSON();
    if (!singleMediaItem && editor.isEmpty) return;

    setIsSubmitting(true);
    try {
      const mediaId: string | undefined = singleMediaItem?.id;
      if (isUpdate && data?._id) {
        await commentService.updateComment(data._id, { content, mediaId });
        toast.success('Chỉnh sửa bình luận thành công');
      } else {
        await commentService.createComment({
          postId,
          content,
          mediaId,
          parentId,
        });
        if (!parentId) toast.success('Đăng bình luận thành công');
      }
      if (!parentId) invalidateRootsComments(postId);
      else invalidateReplies(parentId);
      incrementComments(postId);

      editor.commands.clearContent();
      handleMediaChange([], {});
      onSuccess?.();
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra, vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!editor) return null;

  const canSubmit = !editor.isEmpty || !!singleMediaItem;

  const isDisabled =
    !canSubmit ||
    isSubmitting ||
    isPendingDebounce ||
    (isUpdate && !hasChanges) ||
    hasUploadingFiles ||
    hasUploadErrors;

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
                    disabled={isSubmitting || media.length > 0}
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
