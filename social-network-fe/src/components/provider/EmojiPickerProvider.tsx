'use client';

import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

import { EmojiClickData } from 'emoji-picker-react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useInteractions,
} from '@floating-ui/react';

type EmojiPickerContextType = {
  openPicker: (options: {
    anchorEl: HTMLElement;
    onSelect: (emoji: EmojiClickData) => void;
  }) => void;
  closePicker: () => void;
};

const EmojiPickerContext = createContext<EmojiPickerContextType | null>(null);

export function EmojiPickerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const onSelectRef = useRef<(emoji: EmojiClickData) => void>(null);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePress: true,
    escapeKey: true,
  });
  const { getFloatingProps } = useInteractions([click, dismiss]);

  const openPicker = ({
    anchorEl,
    onSelect,
  }: {
    anchorEl: HTMLElement;
    onSelect: (emoji: EmojiClickData) => void;
  }) => {
    if (isOpen && anchorEl === refs.reference.current) {
      setIsOpen(false);
      return;
    }

    setAnchorEl(anchorEl);
    refs.setReference(anchorEl);
    onSelectRef.current = onSelect;
    setIsOpen(true);
  };

  const closePicker = () => setIsOpen(false);

  return (
    <EmojiPickerContext.Provider value={{ openPicker, closePicker }}>
      {children}

      <div
        ref={refs.setFloating}
        data-emoji-picker="true"
        style={{
          ...floatingStyles,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: isOpen ? 9999 : 'auto',
        }}
        {...getFloatingProps()}
        className=" bg-white shadow-lg rounded-lg border"
      >
        <EmojiPicker
          lazyLoadEmojis
          searchDisabled
          skinTonesDisabled
          allowExpandReactions={false}
          width={320}
          height={400}
          onEmojiClick={(emoji) => {
            onSelectRef.current?.(emoji);
            closePicker();
          }}
        />
      </div>
    </EmojiPickerContext.Provider>
  );
}

export const useEmojiPicker = () => {
  const ctx = useContext(EmojiPickerContext);
  if (!ctx) {
    throw new Error('useEmojiPicker must be used inside EmojiPickerProvider');
  }
  return ctx;
};
