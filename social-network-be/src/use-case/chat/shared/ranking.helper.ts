import { Types } from 'mongoose';
import { SubMediaModel } from 'src/domains/media-upload/interfaces/media';
import { UserMinimalModelWithLastActiveTime } from 'src/domains/user/interfaces';
import { ConversationDocument } from 'src/schemas';

export interface RankableUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  avatar: SubMediaModel<Types.ObjectId>;
  lastActiveAt: Date;
  lastInteractiveAt?: Date;
}

export interface RankedUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  avatar: SubMediaModel<Types.ObjectId>;
  isOnline: boolean;
  lastActiveAt: Date;
  lastInteractiveAt: Date;
  score: number;
}

export class RankingHelper {
  private static readonly TEN_MINUTES = 10 * 60 * 1000;
  private static readonly THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
  private static readonly TWELVE_HOURS = 12 * 60 * 60 * 1000;

  static rankUsers(usersMap: Map<string, RankableUser>): RankedUser[] {
    const now = Date.now();

    return Array.from(usersMap.values())
      .map((user) => {
        const lastActiveTime = user.lastActiveAt
          ? new Date(user.lastActiveAt).getTime()
          : 0;
        const isOnline = now - lastActiveTime < this.TEN_MINUTES;

        let score = lastActiveTime;

        if (user.lastInteractiveAt) {
          const lastInteractiveTime = new Date(
            user.lastInteractiveAt,
          ).getTime();
          const timePassed = now - lastInteractiveTime;

          if (timePassed < this.THREE_DAYS) {
            const bonus =
              this.TWELVE_HOURS * (1 - timePassed / this.THREE_DAYS);
            score += bonus;
          }
        }

        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          avatar: user.avatar,
          isOnline,
          lastActiveAt: user.lastActiveAt,
          lastInteractiveAt: user.lastInteractiveAt,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);
  }
  static prepareUsersMap(
    currentUserId: string,
    friends: UserMinimalModelWithLastActiveTime<Types.ObjectId>[],
    conversations: ConversationDocument[],
  ): Map<string, RankableUser> {
    const usersMap = new Map<string, RankableUser>();

    friends.forEach((friend) => {
      if (friend._id.toString() === currentUserId) {
        return;
      }
      usersMap.set(friend._id.toString(), {
        _id: friend._id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        username: friend.username,
        avatar: friend.avatar,
        lastActiveAt: friend.lastActiveAt,
      });
    });

    conversations.forEach((conversation) => {
      const participant = conversation.participants.find(
        (p: any) =>
          p.user?._id &&
          p.user._id.toString() !== currentUserId &&
          p.user.firstName,
      );

      if (participant) {
        const friend = (participant as any).user;
        const id = friend._id.toString();
        const existing = usersMap.get(id);

        usersMap.set(id, {
          _id: friend._id as Types.ObjectId,
          firstName: friend.firstName,
          lastName: friend.lastName,
          username: friend.username,
          avatar: friend.avatar,
          lastActiveAt: friend.lastActiveAt || existing?.lastActiveAt,
          lastInteractiveAt: conversation.lastInteractiveAt,
        });
      }
    });

    return usersMap;
  }
}
