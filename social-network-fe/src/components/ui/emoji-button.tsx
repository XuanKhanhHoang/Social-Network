import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { EmojiClickData } from 'emoji-picker-react';
import { useEmojiPicker } from '../provider/EmojiPickerProvider';

export default function EmojiButton({ editor }: { editor: Editor | null }) {
  const { openPicker } = useEmojiPicker();

  const handleEmojiClick = (emoji: EmojiClickData) => {
    editor
      ?.chain()
      .focus()
      .insertContent({
        type: 'emoji',
        attrs: {
          src: emoji.getImageUrl(),
          alt: emoji.emoji,
        },
      })
      .run();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8"
      title="Thêm emoji"
      onClick={(e) =>
        openPicker({ anchorEl: e.currentTarget, onSelect: handleEmojiClick })
      }
    >
      <Smile className="h-4 w-4" />
    </Button>
  );
}
