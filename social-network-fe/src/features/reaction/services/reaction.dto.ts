import { ReactionTargetType } from '@/lib/constants/enums';

export interface ReactionsBreakdownDto {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}
export interface ReactionDto {
  _id: string;
  user: string;
  targetId: string;
  targetType: ReactionTargetType;
  reactionType: keyof ReactionsBreakdownDto;
}

export interface ToggleReactionResponseDto {
  action: 'added' | 'updated' | 'removed';
  reaction: ReactionDto | null;
  delta: 1 | 0 | -1;
}

export interface RemoveReactionResponseDto {
  action: 'removed';
  reaction: null;
  delta: 0;
}
