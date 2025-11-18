'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { Smile, ImageIcon, MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextStyle } from '@tiptap/extension-text-style';
import { Input } from '@/components/ui/input';
import { Emoji } from '@/lib/editor/emoji-node';
import { postService } from '@/services/post';
import { PostMediaCreateRequestDto } from '@/lib/dtos';
import { toast } from 'sonner';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { useMediaUpload } from '@/hooks/media/useMediaUpload';
import { postKeys, useCreatePost } from '@/hooks/post/usePost';
import PostEditorToolbar from './Toolbars';
import { PostInEditor } from './type';
import PostEditorMedia from '../../media/create-post-editor/MediaEditor';

export type PostEditorProps = {
  handleClose: () => void;
  mode?: 'create' | 'edit';
  post?: PostInEditor;
};

const usePostEditor = ({
  handleClose,
  mode = 'create',
  post,
}: PostEditorProps) => {
  const isEditMode = mode === 'edit';
  const queryClient = useQueryClient();
  const initialPost = useRef(post);
  const isEditorInitialized = useRef(false);

  const [bg, setBg] = useState(post?.backgroundValue || 'bg-white');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPendingDebounce, setIsPendingDebounce] = useState(false);

  const create = useCreatePost();

  const {
    media,
    captions,
    handleMediaUpload,
    handleMediaChange,
    retryUpload,
    hasUploadingFiles,
    hasUploadErrors,
  } = useMediaUpload({
    initialMedia:
      post?.media?.map((item) => ({
        ...item,
        isConfirmed: true,
      })) || [],
    initialCaptions:
      post?.media?.reduce<Record<number, string>>((acc, item, idx) => {
        acc[idx] = item.caption || '';
        return acc;
      }, {}) || {},
    maxFiles: 10,
    maxSizeMB: 200,
  });

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
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Bạn đang nghĩ gì thế?',
        showOnlyWhenEditable: true,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Emoji,
    ],
    content: post?.content || '',
    immediatelyRender: false,
    onCreate: () => {
      isEditorInitialized.current = true;
    },
    onUpdate: () => {
      if (isEditorInitialized.current) {
        setIsPendingDebounce(true);
        debouncedUpdate();
      }
    },
  });

  const hasChanges = useMemo(() => {
    if (
      !isEditMode ||
      !initialPost.current ||
      !editor ||
      !isEditorInitialized.current
    ) {
      return false;
    }

    const original = initialPost.current;

    let originalContent;
    try {
      originalContent =
        typeof original.content === 'string'
          ? JSON.parse(original.content)
          : original.content;
    } catch {
      originalContent = {};
    }
    const contentChanged = !_.isEqual(editor.getJSON(), originalContent);

    const bgChanged = bg !== original.backgroundValue;

    const originalMediaIds = original.media?.map((m) => m.mediaId).sort() || [];
    const currentMediaIds = media
      .filter((m) => m.id)
      .map((m) => m.id)
      .sort();
    const mediaChanged = !_.isEqual(originalMediaIds, currentMediaIds);

    const originalCaptions =
      original.media?.reduce<Record<string, string>>((acc, item) => {
        if (item.mediaId) acc[item.mediaId] = item.caption || '';
        return acc;
      }, {}) || {};

    const currentCaptions = media.reduce<Record<string, string>>(
      (acc, item, idx) => {
        if (item.id) acc[item.id] = captions[idx] || '';
        return acc;
      },
      {}
    );
    const captionsChanged = !_.isEqual(originalCaptions, currentCaptions);

    return contentChanged || bgChanged || mediaChanged || captionsChanged;
  }, [isEditMode, bg, media, captions, editor]);

  const handleSubmit = useCallback(async () => {
    if (editor?.isEmpty && media.length === 0) return;
    if (isEditMode && !hasChanges) return;

    setIsSubmitting(true);

    try {
      if (hasUploadingFiles) {
        alert('Có file đang upload. Vui lòng đợi hoàn tất.');
        setIsSubmitting(false);
        return;
      }

      const mediaInfo: PostMediaCreateRequestDto[] = media.map((item, idx) => ({
        mediaId: item.id!,
        caption: captions[idx] || '',
        order: idx,
      }));

      if (isEditMode) {
        await postService.updatePost(post!.id, {
          content: editor!.getJSON(),
          backgroundValue: bg,
          media: mediaInfo,
        });
        queryClient.invalidateQueries({ queryKey: postKeys.detail(post!.id) });
      } else {
        await create.mutateAsync({
          content: editor!.getJSON(),
          backgroundValue: bg,
          media: mediaInfo,
        });
      }

      toast.success(
        isEditMode ? 'Cập nhật bài thành công!' : 'Đăng bài thành công!'
      );
      handleClose();
    } catch (error) {
      console.error('Post operation failed:', error);
      toast.error(isEditMode ? 'Cập nhật bài thất bại!' : 'Đăng bài thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    editor,
    media,
    captions,
    bg,
    isEditMode,
    hasChanges,
    post,
    handleClose,
    hasUploadingFiles,
    queryClient,
  ]);

  const canSubmit = !editor?.isEmpty || media.length > 0;
  const isDisabled =
    hasUploadingFiles ||
    !canSubmit ||
    isSubmitting ||
    hasUploadErrors ||
    isPendingDebounce ||
    (isEditMode && !hasChanges);

  return {
    editor,
    bg,
    setBg,
    showBgPicker,
    setShowBgPicker,
    showTextColorPicker,
    setShowTextColorPicker,
    isSubmitting,
    isPendingDebounce,
    media,
    captions,
    handleMediaChange,
    handleMediaUpload,
    retryUpload,
    hasUploadingFiles,
    isEditMode,
    handleSubmit,
    isDisabled,
  };
};

export default function PostEditor(props: PostEditorProps) {
  const {
    editor,
    bg,
    setBg,
    showBgPicker,
    setShowBgPicker,
    showTextColorPicker,
    setShowTextColorPicker,
    isSubmitting,
    isPendingDebounce,
    media,
    captions,
    handleMediaChange,
    handleMediaUpload,
    retryUpload,
    hasUploadingFiles,
    isEditMode,
    handleSubmit,
    isDisabled,
  } = usePostEditor(props);

  if (!editor) return null;

  return (
    <div className="fixed inset-0  bg-black/50 flex  justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg h-fit  max-h-[825px] overflow-auto  mt-16">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="w-6"></div>
          <h2 className="text-xl font-semibold">
            {isEditMode ? 'Cập nhật' : 'Tạo'} bài viết
          </h2>
          <button
            onClick={props.handleClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 max-w-lg mx-auto">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">U</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Bạn</div>
              <div className="text-sm text-gray-500">Công khai</div>
            </div>
          </div>

          <div className="p-4">
            <div
              className={`relative ${bg} rounded-lg transition-all duration-200`}
            >
              <EditorContent
                editor={editor}
                className="min-h-[120px] p-4 prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:border-none"
              />
            </div>

            {media.length > 0 && (
              <div className="mt-3">
                <PostEditorMedia
                  media={media}
                  captions={captions}
                  handle={{
                    onChange: handleMediaChange,
                    handleMediaUpload,
                    onRetryUpload: retryUpload,
                  }}
                />
              </div>
            )}

            <PostEditorToolbar
              editor={editor}
              bg={bg}
              setBg={setBg}
              showBgPicker={showBgPicker}
              setShowBgPicker={setShowBgPicker}
              showTextColorPicker={showTextColorPicker}
              setShowTextColorPicker={setShowTextColorPicker}
            />
          </div>

          <div className="flex items-center justify-between p-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <ImageIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Ảnh/Video</span>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaUpload}
                  disabled={hasUploadingFiles || isSubmitting}
                  className="hidden"
                />
              </label>

              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Smile className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">Cảm xúc</span>
              </button>

              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 disabled:opacity-50"
            >
              {isSubmitting
                ? isEditMode
                  ? 'Đang cập nhật...'
                  : 'Đang đăng...'
                : isPendingDebounce
                ? 'Đang xử lý...'
                : isEditMode
                ? 'Cập nhật'
                : 'Đăng'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
