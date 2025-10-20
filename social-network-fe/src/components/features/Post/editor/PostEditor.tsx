'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smile,
  ImageIcon,
  MoreHorizontal,
  Palette,
  Type,
  Minus,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextStyle } from '@tiptap/extension-text-style';
import { Input } from '@/components/ui/input';
import { Emoji } from '@/lib/editor/emoji-node';
import EmojiButton from '@/components/ui/emoji-button';
import { postService } from '@/services/post';
import { PostMediaDto } from '@/lib/dtos';
import { toast } from 'sonner';
import PostEditorMedia from './PostEditorMedia';
import _ from 'lodash';
import { PostEditorProps } from './type';
import { useQueryClient } from '@tanstack/react-query';
import { useMediaUpload } from '@/hooks/media/useMediaUpload';
import { postKeys } from '@/hooks/post/usePost';

const bgPresets = [
  { bg: 'bg-white', name: 'Trắng' },
  { bg: 'bg-gray-100', name: 'Xám' },
  { bg: 'bg-yellow-100', name: 'Vàng' },
  { bg: 'bg-pink-100', name: 'Hồng' },
  { bg: 'bg-blue-100', name: 'Xanh' },
  { bg: 'bg-green-100', name: 'Lục' },
  {
    bg: 'bg-gradient-to-r from-pink-400 to-red-400 text-white',
    name: 'Hồng - Đỏ',
  },
  {
    bg: 'bg-gradient-to-r from-blue-500 to-teal-400 text-white',
    name: 'Xanh biển - Teal',
  },
  {
    bg: 'bg-gradient-to-r from-purple-500 to-indigo-400 text-white',
    name: 'Tím - Indigo',
  },
];

const textColors = [
  { color: '#000000', name: 'Đen' },
  { color: '#6b7280', name: 'Xám' },
  { color: '#dc2626', name: 'Đỏ' },
  { color: '#ea580c', name: 'Cam' },
  { color: '#ca8a04', name: 'Vàng' },
  { color: '#16a34a', name: 'Xanh lá' },
  { color: '#2563eb', name: 'Xanh dương' },
  { color: '#9333ea', name: 'Tím' },
  { color: '#db2777', name: 'Hồng' },
];

export default function PostEditor({
  handleClose,
  mode = 'create',
  post,
}: PostEditorProps) {
  const isEditMode = mode == 'edit';
  const queryClient = useQueryClient();

  const [bg, setBg] = useState(post?.backgroundValue || 'bg-white');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [isPendingDebounce, setIsPendingDebounce] = useState(false);

  const debouncedUpdate = useMemo(
    () =>
      _.debounce(() => {
        setIsPendingDebounce(false);
      }, 300),
    []
  );

  const {
    media,
    captions,
    handleMediaUpload,
    handleMediaChange,
    retryUpload,
    retryConfirm,
    confirmAllUnconfirmed,
    hasUploadingFiles,
    hasUploadErrors,
    hasConfirmErrors,
  } = useMediaUpload({
    initialMedia:
      post?.media.map((item) => ({
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

  const initialPost = useRef(post);

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
      setTimeout(() => setEditorReady(true), 100);
    },
    onUpdate: () => {
      if (editorReady) {
        setIsPendingDebounce(true);
        debouncedUpdate();
      }
    },
  });

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialPost.current || !editorReady || !editor) {
      return false;
    }

    const originalPost = initialPost.current;
    const currentContent = editor.getJSON();

    let originalContent;
    try {
      originalContent =
        typeof originalPost.content === 'string'
          ? JSON.parse(originalPost.content)
          : originalPost.content;
    } catch {
      originalContent = originalPost.content;
    }

    const contentChanged =
      JSON.stringify(currentContent) !== JSON.stringify(originalContent);
    const bgChanged = bg !== originalPost.backgroundValue;

    const originalMediaIds =
      originalPost.media?.map((m) => m.mediaId).sort() || [];
    const currentMediaIds = media
      .filter((m) => m.id)
      .map((m) => m.id)
      .sort();

    const mediaChanged =
      JSON.stringify(originalMediaIds) !== JSON.stringify(currentMediaIds);

    const originalCaptions =
      originalPost.media?.reduce<Record<string, string>>((acc, item) => {
        if (item.mediaId) acc[item.mediaId] = item.caption || '';
        return acc;
      }, {}) || {};

    const currentCaptions = media.reduce<Record<string, string>>(
      (acc, item, idx) => {
        if (item.id && item.isConfirmed) acc[item.id] = captions[idx] || '';
        return acc;
      },
      {}
    );

    const captionsChanged =
      JSON.stringify(originalCaptions) !== JSON.stringify(currentCaptions);

    return contentChanged || bgChanged || mediaChanged || captionsChanged;
  }, [isEditMode, bg, media, captions, editorReady, editor]);

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

      const confirmResult = await confirmAllUnconfirmed();

      if (!confirmResult.success) {
        setIsSubmitting(false);
        return;
      }

      const confirmedMedia = confirmResult.updatedMedia.filter(
        (m) => m.isConfirmed && m.id
      );
      const mediaInfo: PostMediaDto[] = confirmedMedia.map((item) => {
        const originalIndex = confirmResult.updatedMedia.findIndex(
          (m) => m === item
        );
        return {
          id: item.id!,
          caption: captions[originalIndex] || '',
        };
      });

      console.log('MediaInfo to submit:', mediaInfo);

      if (isEditMode) {
        await postService.updatePost(post!._id, {
          content: editor!.getJSON(),
          backgroundValue: bg,
          media: mediaInfo,
        });
        queryClient.invalidateQueries({ queryKey: postKeys.detail(post!._id) });
      } else {
        await postService.createPost({
          content: editor!.getJSON(),
          backgroundValue: bg,
          media: mediaInfo,
        });
        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
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
    confirmAllUnconfirmed,
    queryClient,
  ]);

  const canSubmit = !editor?.isEmpty || media.length > 0;

  const isDisabled =
    hasUploadingFiles ||
    !canSubmit ||
    isSubmitting ||
    hasUploadErrors ||
    hasConfirmErrors ||
    isPendingDebounce ||
    (isEditMode && !hasChanges);

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
            onClick={handleClose}
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
                    onRetryConfirm: retryConfirm,
                  }}
                />
              </div>
            )}

            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`h-8 ${
                    editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''
                  }`}
                  title="In đậm"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`h-8 ${
                    editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''
                  }`}
                  title="In nghiêng"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`h-8 ${
                    editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : ''
                  }`}
                  title="Gạch ngang"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Text alignment buttons */}
                {['left', 'center', 'right'].map((align) => (
                  <Button
                    key={align}
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      editor.chain().focus().setTextAlign(align).run()
                    }
                    className={`h-8 ${
                      editor.isActive({ textAlign: align })
                        ? 'bg-blue-100 text-blue-600'
                        : ''
                    }`}
                    title={`Căn ${
                      align === 'left'
                        ? 'trái'
                        : align === 'center'
                        ? 'giữa'
                        : 'phải'
                    }`}
                  >
                    {align === 'left' && <AlignLeft className="h-4 w-4" />}
                    {align === 'center' && <AlignCenter className="h-4 w-4" />}
                    {align === 'right' && <AlignRight className="h-4 w-4" />}
                  </Button>
                ))}

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    className="h-8"
                    title="Màu chữ"
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().unsetAllMarks().run()}
                  className="h-8"
                  title="Xóa định dạng"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBgPicker(!showBgPicker)}
                    className="h-8"
                    title="Màu nền"
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                </div>

                <EmojiButton editor={editor} />
              </div>
            </div>

            {showTextColorPicker && (
              <div className="my-2 bg-white border rounded-lg shadow-md p-2 flex justify-between flex-wrap min-w-32">
                {textColors.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => {
                      editor.chain().focus().setColor(preset.color).run();
                      setShowTextColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  />
                ))}
              </div>
            )}

            {showBgPicker && (
              <div className="my-2 bg-white border rounded-lg shadow-md p-2 flex justify-between min-w-40">
                {bgPresets.map((preset) => (
                  <button
                    key={preset.bg}
                    onClick={() => {
                      setBg(preset.bg);
                      setShowBgPicker(false);
                    }}
                    className={`w-8 h-8 rounded border ${
                      bg === preset.bg
                        ? 'border-blue-500 scale-110'
                        : 'border-gray-300'
                    }`}
                    title={preset.name}
                  >
                    <div className={`${preset.bg} w-full h-full rounded`} />
                  </button>
                ))}
              </div>
            )}
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
