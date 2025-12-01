import { Button } from '@/components/ui/button';
import { ImagePlus, X, SendHorizontal } from 'lucide-react';
import { EditorContent, JSONContent } from '@tiptap/react';
import { useChatInput } from '../../hooks/useChatInput';
import EmojiButton from '@/components/ui/emoji-button';
import { cn } from '@/lib/utils';

interface ChatInputAreaProps {
  onSend: (
    content: JSONContent | null,
    media?: { file: File; previewUrl: string }
  ) => void;
  className?: string;
}

export const ChatInputArea = ({ onSend, className }: ChatInputAreaProps) => {
  const { editor, media, handleFileSelect, removeMedia, handleSend } =
    useChatInput({
      onSend,
    });

  if (!editor) return null;

  return (
    <div className={cn('p-3 bg-white border-t border-gray-100', className)}>
      {media && (
        <div className="mb-2 relative inline-block group">
          <img
            src={media.previewUrl}
            alt="Selected"
            className="h-20 w-auto rounded-lg border border-gray-200 object-cover"
          />
          <button
            onClick={removeMedia}
            className="absolute -top-1.5 -right-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-full p-0.5 shadow-sm transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <div className="flex items-end gap-3">
        <div className="flex items-center gap-3 pb-2">
          <label className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
            <ImagePlus size={24} strokeWidth={1.5} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          <div className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
            <EmojiButton editor={editor} />
          </div>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 min-h-[40px] flex items-center focus-within:border-gray-400 transition-colors">
          <EditorContent
            editor={editor}
            className="w-full text-[15px] max-h-[100px] overflow-y-auto [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[24px]"
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={editor.isEmpty && !media} //TODO: BUG Editor is not empty but disabled
          size="icon"
          className="h-10 w-10 bg-gray-900 hover:bg-black text-white rounded-lg flex-shrink-0 mb-0 shadow-sm transition-colors"
        >
          <SendHorizontal size={20} className="ml-0.5" />
        </Button>
      </div>
    </div>
  );
};
