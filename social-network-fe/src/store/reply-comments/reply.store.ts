import { create } from 'zustand';
import { CommentWithMyReaction } from '@/lib/interfaces/comment';

interface ReplyingTo {
  comment: CommentWithMyReaction;
  rootId: string;
}

interface ReplyState {
  replyingTo: ReplyingTo | null;
  setReplyingTo: (replyInfo: ReplyingTo | null) => void;
}

export const useReplyStore = create<ReplyState>((set) => ({
  replyingTo: null,
  setReplyingTo: (replyInfo) => {
    set({ replyingTo: replyInfo });
  },
}));
