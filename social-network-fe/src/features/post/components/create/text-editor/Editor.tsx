'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Color from '@tiptap/extension-color';
import {
  Smile,
  ImageIcon,
  MoreHorizontal,
  X,
  Globe,
  Users,
  Lock,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postService } from '@/features/post/services/post.service';
import { PostMediaCreateRequestDto } from '@/lib/dtos';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useCreatePost, postKeys } from '@/features/post/hooks/usePost';
import { useMediaUpload } from '@/features/media/hooks/useMediaUpload';
import _ from 'lodash';
import PostEditorToolbar from './Toolbars';
import { TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { Emoji } from '@/lib/editor/emoji-node';
import { PostInEditor } from './type';
import PostEditorMedia from '../media-editor/MediaEditor';
import { useStore } from '@/store';
import { UserAvatar } from '@/components/ui/user-avatar';
import { VisibilityPrivacy } from '@/lib/constants/enums/visibility-privacy';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Post } from '@/features/post/types/post';
import SharedPostCard from '../../list/SharedPostCard';

export type PostEditorProps = {
  handleClose: () => void;
  mode?: 'create' | 'edit' | 'share';
  post?: PostInEditor;
  sharedPost?: Post;
};

const usePostEditor = ({
  handleClose,
  mode = 'create',
  post,
  sharedPost,
}: PostEditorProps) => {
  const isEditMode = mode === 'edit';
  const isShareMode = mode === 'share';
  const queryClient = useQueryClient();
  const initialPost = useRef(post);
  const isEditorInitialized = useRef(false);

  const [bg, setBg] = useState(post?.backgroundValue || 'bg-white');
  const [visibility, setVisibility] = useState<VisibilityPrivacy>(
    post?.visibility || VisibilityPrivacy.PUBLIC
  );

  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPendingDebounce, setIsPendingDebounce] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

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
        id: item.mediaId,
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

  const initialContent = useMemo(() => {
    if (!post?.content) return '';
    if (typeof post.content === 'string') {
      try {
        return JSON.parse(post.content);
      } catch {
        return post.content;
      }
    }
    return post.content;
  }, [post?.content]);

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
    content: initialContent,
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
      originalContent = { type: 'doc', content: [] };
    }

    const currentContent = editor.getJSON();
    const contentChanged = !_.isEqual(currentContent, originalContent);

    const bgChanged = bg !== (original.backgroundValue || 'bg-white');
    const visibilityChanged =
      visibility !== (original.visibility || VisibilityPrivacy.PUBLIC);

    const originalMediaIds = original.media?.map((m) => m.mediaId).sort() || [];
    const currentMediaIds = media
      .filter((m) => m.id && !m.isUploading && !m.uploadError)
      .map((m) => m.id)
      .sort();

    const hasUploadingOrNewFiles = media.some((m) => m.isUploading || !m.id);
    const mediaChanged =
      hasUploadingOrNewFiles || !_.isEqual(originalMediaIds, currentMediaIds);

    const originalCaptions =
      original.media?.reduce<Record<string, string>>((acc, item) => {
        if (item.mediaId) acc[item.mediaId] = item.caption || '';
        return acc;
      }, {}) || {};

    const currentCaptions = media.reduce<Record<string, string>>(
      (acc, item, idx) => {
        if (item.id && !item.isUploading && !item.uploadError) {
          acc[item.id] = captions[idx] || '';
        }
        return acc;
      },
      {}
    );
    const captionsChanged = !_.isEqual(originalCaptions, currentCaptions);

    return (
      contentChanged ||
      bgChanged ||
      mediaChanged ||
      captionsChanged ||
      visibilityChanged
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, bg, media, captions, editor?.state.doc, visibility]);

  const handleSubmit = useCallback(async () => {
    if (editor?.isEmpty && media.length === 0) return;
    if (isEditMode && !hasChanges) return;

    if (isEditMode && !post) {
      toast.error('Lỗi dữ liệu bài viết');
      return;
    }

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
          visibility,
        });
        queryClient.invalidateQueries({ queryKey: postKeys.detail(post!.id) });
        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      } else if (isShareMode && sharedPost) {
        await create.mutateAsync({
          content: editor!.getJSON(),
          backgroundValue: bg,
          media: [],
          visibility,
          parentPostId: sharedPost.id,
        });
        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      } else {
        await create.mutateAsync({
          content: editor!.getJSON(),
          backgroundValue: bg,
          media: mediaInfo,
          visibility,
        });
        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      }

      toast.success(
        isEditMode
          ? 'Cập nhật bài thành công!'
          : isShareMode
          ? 'Chia sẻ bài viết thành công!'
          : 'Đăng bài thành công!'
      );
      handleClose();
    } catch (error) {
      console.error('Post operation failed:', error);
      toast.error(
        isEditMode
          ? 'Cập nhật bài thất bại!'
          : isShareMode
          ? 'Chia sẻ bài viết thất bại!'
          : 'Đăng bài thất bại!'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    editor,
    media,
    captions,
    bg,
    visibility,
    isEditMode,
    hasChanges,
    post,
    handleClose,
    hasUploadingFiles,
    queryClient,
    create,
    isShareMode,
    sharedPost,
  ]);

  const canSubmit = !isEditorEmpty || media.length > 0 || isShareMode;
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
    visibility,
    setVisibility,
    openPrivacy,
    setOpenPrivacy,
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
    isShareMode,
    sharedPost,
    handleSubmit,
    isDisabled,
  };
};

export default function PostEditor(props: PostEditorProps) {
  const {
    editor,
    bg,
    setBg,
    visibility,
    setVisibility,
    openPrivacy,
    setOpenPrivacy,
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
    isShareMode,
    sharedPost,
    handleSubmit,
    isDisabled,
  } = usePostEditor(props);

  const user = useStore((state) => state.user);
  if (!editor) return null;

  return (
    <div className="fixed inset-0  bg-black/50 flex  justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg h-fit  max-h-[825px] overflow-auto  mt-16">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="w-6"></div>
          <h2 className="text-xl font-semibold">
            {isEditMode ? 'Cập nhật' : isShareMode ? 'Chia sẻ' : 'Tạo'} bài viết
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
            <UserAvatar
              name={user!.firstName}
              src={user!.avatar?.url}
              className="w-10 h-10"
              size={128}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{user!.firstName}</div>

              <Popover open={openPrivacy} onOpenChange={setOpenPrivacy}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors outline-none">
                    {visibility === VisibilityPrivacy.PUBLIC && (
                      <Globe className="h-3.5 w-3.5" />
                    )}
                    {visibility === VisibilityPrivacy.FRIENDS && (
                      <Users className="h-3.5 w-3.5" />
                    )}
                    {visibility === VisibilityPrivacy.PRIVATE && (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {visibility === VisibilityPrivacy.PUBLIC
                        ? 'Công khai'
                        : visibility === VisibilityPrivacy.FRIENDS
                        ? 'Bạn bè'
                        : 'Chỉ mình tôi'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  <div className="flex flex-col gap-0.5">
                    {[
                      {
                        value: VisibilityPrivacy.PUBLIC,
                        label: 'Công khai',
                        icon: <Globe className="h-4 w-4" />,
                      },
                      {
                        value: VisibilityPrivacy.FRIENDS,
                        label: 'Bạn bè',
                        icon: <Users className="h-4 w-4" />,
                      },
                      {
                        value: VisibilityPrivacy.PRIVATE,
                        label: 'Chỉ mình tôi',
                        icon: <Lock className="h-4 w-4" />,
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setVisibility(option.value);
                          setOpenPrivacy(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-gray-100 transition-colors text-left',
                          visibility === option.value &&
                            'bg-blue-50 text-blue-600'
                        )}
                      >
                        {option.icon}
                        <span className="flex-1">{option.label}</span>
                        {visibility === option.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="p-4">
            <div
              className={`relative ${bg} rounded-lg transition-all duration-200`}
            >
              <EditorContent
                editor={editor}
                className={`${
                  isShareMode ? 'min-h-[30px]' : 'min-h-[120px]'
                } p-4 prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:border-none`}
              />
            </div>

            {isShareMode && sharedPost && (
              <div className="mt-3">
                <SharedPostCard post={sharedPost} />
              </div>
            )}

            {!isShareMode && media.length > 0 && (
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

            {!isShareMode && (
              <PostEditorToolbar
                editor={editor}
                bg={bg}
                setBg={setBg}
                showBgPicker={showBgPicker}
                setShowBgPicker={setShowBgPicker}
                showTextColorPicker={showTextColorPicker}
                setShowTextColorPicker={setShowTextColorPicker}
              />
            )}
          </div>

          <div className="flex items-center justify-between p-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              {!isShareMode && (
                <>
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
                </>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 disabled:opacity-50"
            >
              {isSubmitting
                ? isEditMode
                  ? 'Đang cập nhật...'
                  : isShareMode
                  ? 'Đang chia sẻ...'
                  : 'Đang đăng...'
                : isPendingDebounce
                ? 'Đang xử lý...'
                : isEditMode
                ? 'Cập nhật'
                : isShareMode
                ? 'Chia sẻ'
                : 'Đăng'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
