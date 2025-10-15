import { ReactionsBreakdown } from 'src/share/dto/other/reaction-break-down';

export interface CreateCommentResponse {
  post: string;
  author: string;
  content: JSON;
  reactionsCount: number;
  reactionsBreakdown: ReactionsBreakdown;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
