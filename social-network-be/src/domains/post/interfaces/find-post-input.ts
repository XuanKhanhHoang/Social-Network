import { PostCursorData } from './post-cursor-data';

export type FindPostForHomeFeedData = {
  limit: number;
  requestingUserId: string;
  cursor?: PostCursorData;
  authorIds: string[];
};
