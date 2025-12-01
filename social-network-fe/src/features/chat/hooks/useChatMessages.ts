import { useState, useCallback } from 'react';
import { JSONContent } from '@tiptap/react';

export interface ChatMessage {
  id: string;
  content: JSONContent | null;
  senderId: string;
  createdAt: string;
  status: 'sending' | 'sent' | 'error';
  media?: {
    url: string;
    type: 'image' | 'video';
  };
}

export const useChatMessages = (sessionId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = useCallback(
    async (
      content: JSONContent | null,
      media?: { file: File; previewUrl: string }
    ) => {
      const tempId = crypto.randomUUID();

      const newMessage: ChatMessage = {
        id: tempId,
        content,
        senderId: 'me',
        createdAt: new Date().toISOString(),
        status: 'sending',
        media: media ? { url: media.previewUrl, type: 'image' } : undefined,
      };

      setMessages((prev) => [...prev, newMessage]);

      try {
        // Simulate API call
        // In real implementation, this would be:
        // const response = await chatService.sendMessage(sessionId, content, media?.file);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, status: 'sent', id: 'server-id-' + tempId }
              : msg
          )
        );
      } catch (error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, status: 'error' } : msg
          )
        );
      }
    },
    [sessionId]
  );

  return {
    messages,
    sendMessage,
  };
};
