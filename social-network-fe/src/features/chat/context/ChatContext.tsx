'use client';

import { UserSummaryDto } from '@/features/user/services/user.dto';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

export type ChatSessionType = 'private' | 'group' | 'search';

export interface GroupData {
  conversationId: string;
  name: string;
  avatar?: string;
  createdBy: string;
  owner?: string;
}

export interface ChatSession {
  id: string; // recipientId for private, conversationId for group
  conversationId?: string;
  type: ChatSessionType;
  data?: UserSummaryDto;
  groupData?: GroupData;
  isMinimized?: boolean;
}

interface ChatContextType {
  sessions: ChatSession[];
  openSession: (session: {
    type: ChatSessionType;
    data?: UserSummaryDto;
    groupData?: GroupData;
  }) => void;
  closeSession: (id: string) => void;
  minimizeSession: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const openSession = useCallback(
    ({
      type,
      data,
      groupData,
    }: {
      type: ChatSessionType;
      data?: UserSummaryDto;
      groupData?: GroupData;
    }) => {
      let sessionId: string;

      if (type === 'search') {
        sessionId = 'search_contact';
      } else if (type === 'private' && data) {
        sessionId = data._id;
      } else if (type === 'group' && groupData) {
        sessionId = groupData.conversationId;
      } else {
        console.error('Invalid session data');
        return;
      }

      setSessions((prev) => {
        const existingSession = prev.find((s) => s.id === sessionId);

        if (existingSession) {
          return prev.map((s) =>
            s.id === sessionId ? { ...s, isMinimized: false } : s
          );
        }

        const newSession: ChatSession = {
          id: sessionId,
          conversationId:
            type === 'group' ? groupData?.conversationId : undefined,
          type,
          data,
          groupData,
          isMinimized: false,
        };

        let newSessions = [...prev, newSession];
        if (newSessions.length > 3) {
          newSessions = newSessions.slice(1);
        }

        return newSessions;
      });
    },
    []
  );

  const closeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const minimizeSession = useCallback((id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isMinimized: !s.isMinimized } : s))
    );
  }, []);

  return (
    <ChatContext.Provider
      value={{ sessions, openSession, closeSession, minimizeSession }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
