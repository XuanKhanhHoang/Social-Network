import { useState, useCallback } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Emoji } from '@/lib/editor/emoji-node';
import { JSONContent } from '@tiptap/react';

export interface ChatInputState {
  media: { file: File; previewUrl: string } | null;
}

export const useChatInput = ({
  placeholder = 'Nhập tin nhắn...',
  onSend,
}: {
  placeholder?: string;
  onSend?: (
    content: JSONContent | null,
    media?: { file: File; previewUrl: string }
  ) => void;
}) => {
  const [media, setMedia] = useState<{ file: File; previewUrl: string } | null>(
    null
  );

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder }), Emoji],
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none max-h-[150px] overflow-y-auto',
      },
    },
    immediatelyRender: false,
  });

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (media) {
          URL.revokeObjectURL(media.previewUrl);
        }
        const previewUrl = URL.createObjectURL(file);
        setMedia({ file, previewUrl });
        e.target.value = '';
      }
    },
    [media]
  );

  const removeMedia = useCallback(() => {
    if (media) {
      URL.revokeObjectURL(media.previewUrl);
      setMedia(null);
    }
  }, [media]);

  const handleSend = useCallback(() => {
    if (!editor) return;

    const isEmpty = editor.isEmpty;
    if (isEmpty && !media) return;

    const content = isEmpty ? null : editor.getJSON();

    onSend?.(content, media || undefined);

    editor.commands.clearContent();
    if (media) setMedia(null);
  }, [editor, media, onSend]);

  return {
    editor,
    media,
    handleFileSelect,
    removeMedia,
    handleSend,
  };
};
