import { Types } from 'mongoose';
import { UserMinimalModel } from './user';

export interface SuggestedFriendCursorData {
  lastScore: number;
  lastId: string;
}
export type SuggestedFriendData = {
  excludeIds: string[];
  provinceCode: string | null;
  detectedCity: string | null;
  limit: number;
  cursor?: SuggestedFriendCursorData;
  mutualFriendIds?: string[];
};
export type SuggestedFriendItemResult = UserMinimalModel<Types.ObjectId> & {
  suggestionScore: number;
};
export type SuggestedFriendResult = SuggestedFriendItemResult[];
