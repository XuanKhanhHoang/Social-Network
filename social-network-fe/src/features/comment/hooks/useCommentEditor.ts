import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Emoji } from '@/lib/editor/emoji-node';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import { JSONContent } from '@tiptap/react';
import { MediaItemWithHandlingStatus } from '@/features/media/components/type';
import { useMediaUpload } from '@/features/media/hooks/useMediaUpload';
import { useUpdatePostCache } from '@/features/post/hooks/usePostCache';
import { commentService } from '@/features/comment/services/comment.service';
import { useUpdateCommentCache } from '@/features/comment/hooks/useCommentCache';

export type UseCommentEditorProps = {
  postId: string;
  parentId?: string;
  data?: {
    content?: JSONContent;
    media?: MediaItemWithHandlingStatus;
    _id: string;
  };
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export const useCommentEditor = ({
  postId,
  parentId,
  data,
  mode,
  onSuccess,
  placeholder = 'Thêm bình luận ...',
  autoFocus = false,
}: UseCommentEditorProps) => {
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
      debounce(() => {
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

  const canSubmit = !!editor && (!editor.isEmpty || !!singleMediaItem);

  const isDisabled =
    !canSubmit ||
    isSubmitting ||
    isPendingDebounce ||
    (isUpdate && !hasChanges) ||
    hasUploadingFiles ||
    hasUploadErrors;

  return {
    editor,
    singleMediaItem,
    isSubmitting,
    isDisabled,
    hasUploadingFiles,
    hasUploadErrors,
    onHookMediaUpload,
    handleRemoveMedia,
    handleSubmit,
  };
};
