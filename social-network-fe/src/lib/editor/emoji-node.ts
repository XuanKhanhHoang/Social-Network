import { Node, mergeAttributes } from '@tiptap/core';

export const Emoji = Node.create({
  name: 'emoji',
  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'img[data-emoji]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        'data-emoji': 'true',
        class: 'emoji inline-block w-5 h-5 align-text-bottom',
      }),
    ];
  },
});
