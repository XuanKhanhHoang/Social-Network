'use client';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, JSONContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Emoji } from '@/lib/editor/emoji-node';
import { mediaService } from '@/services/media';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, SendHorizontal } from 'lucide-react';
import EmojiButton from '@/components/ui/emoji-button';
import { Input } from '@/components/ui/input';
import MediaComponent from '../common/MediaComponent/MediaComponent';
import { commentService } from '@/services/comment';
import { toast } from 'sonner';
import { MediaItemWithHandlingStatus } from '@/types-define/types';
import { cn } from '@/lib/utils';
import _ from 'lodash';

type CommentEditorProps = {
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
  variant = 'minimal',
}: CommentEditorProps) {
  const isUpdate = mode === 'edit';
  const [media, setMedia] = useState<MediaItemWithHandlingStatus | undefined>(
    data?.media
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [isPendingDebounce, setIsPendingDebounce] = useState(false);
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

  const uploadFileToTemp = async (file: File) => {
    try {
      setMedia((current) => current && { ...current, isUploading: true });
      const response = await mediaService.uploadTempMedia(file);
      setMedia((current) =>
        current
          ? {
              ...current,
              id: response.id,
              url: response.url,
              isUploading: false,
            }
          : undefined
      );
    } catch (error) {
      console.error('Upload temp failed:', error);
      setMedia(
        (current) =>
          current && {
            ...current,
            isUploading: false,
            uploadError: 'Upload thất bại',
          }
      );
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newMediaItem: MediaItemWithHandlingStatus = {
      url: URL.createObjectURL(file),
      mediaType: file.type.startsWith('image/') ? 'image' : 'video',
      file,
      isUploading: true,
    };
    setMedia(newMediaItem);
    uploadFileToTemp(file);
    e.target.value = '';
  };

  const handleRemoveMedia = useCallback(() => {
    if (!media) return;
    if (media.url.startsWith('blob:')) URL.revokeObjectURL(media.url);
    if (media.id) mediaService.cancelTempMedia(media.id).catch(console.warn);
    setMedia(undefined);
  }, [media]);

  const hasChanges = useMemo(() => {
    if (!isUpdate || !initialData.current || !editorReady || !editor)
      return false;

    const originalData = initialData.current;
    const contentChanged =
      JSON.stringify(editor.getJSON()) !==
      JSON.stringify(originalData.content || '');
    const mediaChanged = media?.id !== originalData.media?.id;
    return contentChanged || mediaChanged;
  }, [isUpdate, media, editorReady, editor]);

  const handleSubmit = async () => {
    if (!editor || isSubmitting) return;

    const content = editor.isEmpty ? undefined : editor.getJSON();
    if (!media && editor.isEmpty) return;

    setIsSubmitting(true);
    try {
      const mediaId = media?.id;
      if (media?.id && !media.isConfirmed) {
        await mediaService.confirmMedia(media.id);
      }
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
      editor.commands.clearContent();
      setMedia(undefined);
      onSuccess?.();
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!editor) return null;

  const canSubmit = !editor.isEmpty || !!media;

  const isDisabled =
    !canSubmit ||
    isSubmitting ||
    isPendingDebounce ||
    (isUpdate && !hasChanges) ||
    media?.isUploading ||
    !!media?.uploadError;

  const containerClasses = cn({
    'bg-gray-100 rounded-md': variant === 'boxed',
    'bg-transparent': variant === 'minimal',
  });

  return (
    <div className={className}>
      <div className={`flex items-center w-full ${containerClasses}`}>
        <div className="flex-1 flex items-center">
          <EditorContent
            editor={editor}
            className="w-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:py-2 [&_.ProseMirror]:px-3 [&_.ProseMirror]:bg-transparent"
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
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    disabled={isSubmitting || !!media}
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
      {media && (
        <div className="pl-3 pt-2">
          <MediaComponent
            handle={{ onRemove: handleRemoveMedia }}
            item={media}
            className={{ container: 'w-24 h-24' }}
          />
        </div>
      )}
    </div>
  );
}
