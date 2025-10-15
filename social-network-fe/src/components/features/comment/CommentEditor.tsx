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
import { MediaItem, MediaItemWithHandlingStatus } from '@/types-define/types';
import _ from 'lodash';
import { User } from '@/types-define/dtos';
import { useUpdatePostCache } from '@/hooks/queries/usePost';
import { useStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';
function CommentEditor({
  postId,
  data,
  className,
  mode,
}: {
  postId: string;
  data?: {
    content?: JSONContent;
    media?: MediaItem;
    _id: string;
  };
  className?: string;
  mode?: 'create' | 'edit';
}) {
  const isUpdate = mode === 'edit';
  const { addUserComment } = useUpdatePostCache();
  const queryClient = useQueryClient();

  const user = useStore((s) => s.user) as User;
  const [media, setMedia] = useState<MediaItemWithHandlingStatus | undefined>(
    data?.media
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [debouncedForceUpdate, setDebouncedForceUpdate] = useState(0);
  const [isPendingDebounce, setIsPendingDebounce] = useState(false);
  const mediaRef = useRef<MediaItemWithHandlingStatus | undefined>(media);
  const initialComment = useRef(data);
  const debouncedUpdate = useMemo(
    () =>
      _.debounce(() => {
        setDebouncedForceUpdate((x) => x + 1);
        setIsPendingDebounce(false);
      }, 300),
    []
  );
  useEffect(() => {
    mediaRef.current = media;
  }, [media]);
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);
  // const MentionSuggestion = {
  //   items: ({ query }) => {
  //     const users = [
  //       { id: '1', label: 'John Doe' },
  //       { id: '2', label: 'Jane Smith' },
  //       { id: '3', label: 'Peter Jones' },
  //     ];
  //     return users
  //       .filter((item) =>
  //         item.label.toLowerCase().startsWith(query.toLowerCase())
  //       )
  //       .slice(0, 5);
  //   },

  //   render: () => {
  //     // Component để render danh sách gợi ý (bạn có thể tự custom)
  //     // Phần này cần bạn tự xây dựng component để hiển thị danh sách người dùng
  //     // ...
  //     <div></div>;
  //   },
  // };
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Bình luận...',
        showOnlyWhenEditable: true,
      }),
      Emoji,
      // Mention.configure({
      //   HTMLAttributes: {
      //     class: 'mention', // Thêm class để CSS
      //   },
      //   suggestion: MentionSuggestion,
      // }),
    ],
    content: data?.content || '',
    immediatelyRender: false,
    onUpdate: () => {
      if (editorReady) {
        setIsPendingDebounce(true);
        debouncedUpdate();
      }
    },
    onCreate: () => {
      setTimeout(() => setEditorReady(true), 100);
    },
  });

  const uploadFileToTemp = async (file: File) => {
    try {
      setMedia((currentMedia) => {
        if (!currentMedia) return currentMedia;

        return { ...currentMedia, isUploading: true, uploadError: undefined };
      });

      const response = await mediaService.uploadTempMedia(file);

      setMedia((currentMedia) => {
        if (!currentMedia) return currentMedia;

        return {
          ...currentMedia,
          id: response.id,
          url: response.url,
          isUploading: false,
        };
      });
    } catch (error) {
      console.error('Upload temp failed:', error);

      setMedia((currentMedia) => {
        if (!currentMedia) return currentMedia;

        return {
          ...currentMedia,
          isUploading: false,
          uploadError:
            error instanceof Error
              ? error.message
              : 'Upload thất bại. Thử lại?',
        };
      });
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = Array.from(e.target.files)[0];
    const maxSize = 30;

    if (media) {
      alert(`Bạn chỉ có thể chọn tối đa 1 ảnh/video`);
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File ${file.name} quá lớn. Kích thước tối đa là ${maxSize}MB.`);
      return;
    }

    const newMediaItem: MediaItemWithHandlingStatus = {
      url: URL.createObjectURL(file),
      mediaType: file.type.startsWith('image/')
        ? ('image' as const)
        : ('video' as const),
      file,
      isUploading: true,
    };

    setMedia(newMediaItem);

    setTimeout(() => {
      uploadFileToTemp(file);
    }, 0);

    e.target.value = '';
  };
  const hasChanges = useMemo(() => {
    if (!isUpdate || !initialComment.current || !editorReady || !editor) {
      return false;
    }

    const originalComment = initialComment.current;
    const currentContent = editor.getJSON();

    let originalContent;
    try {
      originalContent =
        typeof originalComment.content === 'string'
          ? JSON.parse(originalComment.content)
          : originalComment.content;
    } catch {
      originalContent = originalComment.content;
    }

    const contentChanged =
      JSON.stringify(currentContent) !== JSON.stringify(originalContent);

    const mediaChanged =
      originalComment.media?.id !== media?.id ||
      (originalComment?.media == undefined && media != undefined) ||
      (originalComment?.media != undefined && media == undefined);
    return contentChanged || mediaChanged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, media, editorReady, debouncedForceUpdate]);
  const handleRemoveMedia = useCallback(() => {
    const currentMedia = mediaRef.current;
    if (!currentMedia) return;

    if (currentMedia.url && currentMedia.url.startsWith('blob:')) {
      URL.revokeObjectURL(currentMedia.url);
    }
    if (currentMedia.id) {
      mediaService.cancelTempMedia(currentMedia.id).catch(console.warn);
    }

    setMedia(undefined);
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const currentMedia = mediaRef.current;
    const content = editor?.isEmpty ? undefined : editor?.getJSON();

    if (!currentMedia && editor?.isEmpty) return;

    try {
      setIsSubmitting(true);

      if (currentMedia && currentMedia.id && !currentMedia.isConfirmed) {
        try {
          setMedia((prevMedia) => {
            if (!prevMedia) return prevMedia;

            return {
              ...prevMedia,
              isConfirming: true,
              confirmError: undefined,
            };
          });

          await mediaService.confirmMedia(currentMedia.id);

          setMedia((prevMedia) => {
            if (!prevMedia) return prevMedia;

            return {
              ...prevMedia,
              isConfirming: false,
              isConfirmed: true,
            };
          });
        } catch (error) {
          console.error('Confirm media failed:', error);

          setMedia((prevMedia) => {
            if (!prevMedia) return prevMedia;

            return {
              ...prevMedia,
              isConfirming: false,
              confirmError:
                error instanceof Error
                  ? error.message
                  : 'Xác nhận ảnh thất bại',
            };
          });
          currentMedia.confirmError =
            error instanceof Error ? error.message : 'Xác nhận ảnh thất bại';
        }
      }
      if (currentMedia?.confirmError) return;
      const res = await (!isUpdate
        ? commentService.createComment({
            postId,
            content,
            mediaId: media?.id,
          })
        : commentService.updateComment(data!._id, {
            content,
            mediaId: media?.id,
          }));
      if (isUpdate) {
        toast.success('Chỉnh sửa bình luận thành công');
      } else {
        addUserComment(postId, {
          media:
            media != undefined
              ? {
                  mediaType: media.mediaType,
                  url: media.url,
                }
              : undefined,
          _id: res._id,
          content,
          author: {
            _id: user._id,
            avatar: user.avatar,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          reactionsBreakdown: {
            angry: 0,
            haha: 0,
            like: 0,
            love: 0,
            sad: 0,
            wow: 0,
          },
          reactionsCount: 0,
          createdAt: Date.now().toLocaleString(),
        });
        toast.success('Đăng bình luận thành công');
      }

      editor?.commands.clearContent();
      setMedia(undefined);
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!editor) return null;

  const canSubmit = media || (!media && !editor.isEmpty);
  const hasUploadingFiles = media && media.isUploading != undefined;
  const hasUploadErrors = media && media.uploadError != undefined;
  const hasConfirmErrors = media && media.confirmError != undefined;

  const isDisabled =
    hasUploadingFiles ||
    !canSubmit ||
    isSubmitting ||
    hasUploadErrors ||
    hasConfirmErrors ||
    isPendingDebounce ||
    (isUpdate && !hasChanges);

  return (
    <div className={className || ''}>
      {/* Combined Editor and Toolbar Container */}
      <div className="bg-white transition-all duration-200 p-1 flex items-center">
        <div className="flex-1">
          <EditorContent
            editor={editor}
            className=" max-h-28 overflow-y-auto w-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:resize-none [&_.ProseMirror]:min-h-[2rem]"
          />
        </div>

        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Chọn hình ảnh"
            asChild
          >
            <label>
              <ImagePlus size={16} />
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                disabled={isSubmitting}
                className="hidden"
              />
            </label>
          </Button>
          <EmojiButton editor={editor} />

          <Button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="bg-white text-black hover:bg-gray-50 shadow-none font-medium px-6 disabled:opacity-50 ml-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
            ) : (
              <SendHorizontal />
            )}
          </Button>
        </div>
      </div>

      {media && (
        <div className="grid grid-cols-1 gap-0 rounded-lg ">
          <MediaComponent
            handle={{
              onRemove: handleRemoveMedia,
            }}
            item={media}
            className={{ container: 'w-32 h-32' }}
          />
        </div>
      )}
    </div>
  );
}
export default CommentEditor;
