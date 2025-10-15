import { TiptapDocument, TiptapNode } from '../dto/req/tiptap-content.dto';

export function extractMentions(contentJson: TiptapDocument): string[] {
  const mentionedUserIds = new Set<string>();

  const traverse = (nodes: TiptapNode[] | undefined): void => {
    if (!nodes || nodes.length === 0) {
      return;
    }

    for (const node of nodes) {
      if (node.type === 'mention' && node.attrs?.id) {
        mentionedUserIds.add(node.attrs.id);
      }

      if (node.content) {
        traverse(node.content);
      }
    }
  };

  traverse(contentJson.content);

  return Array.from(mentionedUserIds);
}
