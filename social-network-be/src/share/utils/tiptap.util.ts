export const getPlainTextFromTiptap = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text') {
    return node.text || '';
  }
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(getPlainTextFromTiptap).join(' ');
  }
  return '';
};
