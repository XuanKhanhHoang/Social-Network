'use client';

import { bgPresets, textColors } from './PRESETS';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmojiButton from '@/components/ui/emoji-button';

interface PostEditorToolbarProps {
  editor: Editor;
  bg: string;
  setBg: (bg: string) => void;
  showBgPicker: boolean;
  setShowBgPicker: (show: boolean) => void;
  showTextColorPicker: boolean;
  setShowTextColorPicker: (show: boolean) => void;
}

const PostEditorToolbar = ({
  editor,
  bg,
  setBg,
  showBgPicker,
  setShowBgPicker,
  showTextColorPicker,
  setShowTextColorPicker,
}: PostEditorToolbarProps) => {
  return (
    <>
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

          {['left', 'center', 'right'].map((align) => (
            <Button
              key={align}
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign(align).run()}
              className={`h-8 ${
                editor.isActive({ textAlign: align })
                  ? 'bg-blue-100 text-blue-600'
                  : ''
              }`}
              title={`Căn ${
                align === 'left' ? 'trái' : align === 'center' ? 'giữa' : 'phải'
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
    </>
  );
};
export default PostEditorToolbar;
