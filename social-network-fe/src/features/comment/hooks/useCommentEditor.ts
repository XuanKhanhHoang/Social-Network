import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Emoji } from '@/lib/editor/emoji-node';
import { toast } from 'sonner';
import _ from 'lodash';
import { JSONContent } from '@tiptap/react';
import { MediaItemWithHandlingStatus } from '@/features/media/components/type';
import { useMediaUpload } from '@/features/media/hooks/useMediaUpload';
import { useCreateComment, useUpdateComment } from './useComment';

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
  mode = 'create',
  onSuccess,
  placeholder = 'Thêm bình luận ...',
  autoFocus = false,
}: UseCommentEditorProps) => {
  const isEditMode = mode === 'edit';

  const initialData = useRef(data);
  const isEditorInitialized = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPendingDebounce, setIsPendingDebounce] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

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

  const initialContent = useMemo(() => {
    if (!data?.content) return '';
    if (typeof data.content === 'string') {
      try {
        return JSON.parse(data.content);
      } catch {
        return data.content;
      }
    }
    return data.content;
  }, [data?.content]);
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder }), Emoji],
    content: initialContent,
    autofocus: autoFocus,
    immediatelyRender: false,
    onCreate: () => {
      isEditorInitialized.current = true;
    },
    onUpdate: ({ editor }) => {
      if (isEditorInitialized.current) {
        setIsPendingDebounce(true);
        debouncedUpdate();
        setIsEditorEmpty(editor.isEmpty);
      }
    },
  });

  const hasChanges = useMemo(() => {
    if (
      !isEditMode ||
      !initialData.current ||
      !editor ||
      !isEditorInitialized.current
    ) {
      return false;
    }

    const original = initialData.current;

    let originalContent;
    try {
      originalContent =
        typeof original.content === 'string'
          ? JSON.parse(original.content)
          : original.content;
    } catch {
      originalContent = { type: 'doc', content: [] };
    }

    const currentContent = editor.getJSON();
    const contentChanged = !_.isEqual(currentContent, originalContent);

    const originalMediaId = original.media?.id;
    const currentMediaId = singleMediaItem?.id;

    const hasUploadingOrNewFile =
      singleMediaItem?.isUploading || (singleMediaItem && !singleMediaItem.id);

    const mediaChanged =
      hasUploadingOrNewFile || originalMediaId !== currentMediaId;

    return contentChanged || mediaChanged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, singleMediaItem, editor?.state.doc]);

  const { mutateAsync: createComment } = useCreateComment();
  const { mutateAsync: updateComment } = useUpdateComment();

  const handleRemoveMedia = useCallback(() => {
    handleMediaChange([], {});
  }, [handleMediaChange]);

  const handleSubmit = useCallback(async () => {
    if (!editor || isSubmitting) return;

    if (isEditorEmpty && !singleMediaItem) return;

    if (isEditMode && !hasChanges) return;

    if (isEditMode && !data?._id) {
      toast.error('Lỗi dữ liệu bình luận');
      return;
    }

    setIsSubmitting(true);

    try {
      if (hasUploadingFiles) {
        toast.error('Có file đang upload. Vui lòng đợi hoàn tất.');
        setIsSubmitting(false);
        return;
      }

      const content = isEditorEmpty ? undefined : editor.getJSON();
      const mediaId: string | undefined = singleMediaItem?.id;

      if (isEditMode) {
        await updateComment({
          commentId: data!._id,
          data: { content, mediaId },
        });
        toast.success('Chỉnh sửa bình luận thành công');
      } else {
        await createComment({
          postId,
          content,
          mediaId,
          parentId,
        });
        if (!parentId) toast.success('Đăng bình luận thành công');
      }

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
  }, [
    editor,
    isEditorEmpty,
    singleMediaItem,
    isEditMode,
    hasChanges,
    data,
    hasUploadingFiles,
    updateComment,
    createComment,
    postId,
    parentId,
    handleMediaChange,
    onSuccess,
    isSubmitting,
  ]);

  const canSubmit = !isEditorEmpty || !!singleMediaItem;

  const isDisabled =
    hasUploadingFiles ||
    !canSubmit ||
    isSubmitting ||
    hasUploadErrors ||
    isPendingDebounce ||
    (isEditMode && !hasChanges);

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
    isEditorEmpty,
    hasChanges,
    isEditMode,
  };
};
