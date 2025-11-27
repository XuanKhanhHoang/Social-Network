import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from 'src/share/base-class/base-repository.service';
import { FriendshipDocument } from 'src/schemas/friendship.schema';
import { FriendshipStatus } from 'src/share/enums/friendship-status';
import { FriendshipDocumentModelWithPopulatedUser } from './interfaces';

@Injectable()
export class FriendshipRepository extends BaseRepository<FriendshipDocument> {
  constructor(
    @InjectModel('Friendship')
    private readonly friendshipModel: Model<FriendshipDocument>,
  ) {
    super(friendshipModel);
  }

  async findRelationship(
    userA: string,
    userB: string,
  ): Promise<Pick<
    FriendshipDocument,
    'status' | 'requester' | 'recipient'
  > | null> {
    return this.friendshipModel
      .findOne({
        $or: [
          {
            requester: new Types.ObjectId(userA),
            recipient: new Types.ObjectId(userB),
          },
          {
            requester: new Types.ObjectId(userB),
            recipient: new Types.ObjectId(userA),
          },
        ],
      })
      .select(['status', 'requester', 'recipient'])
      .lean()
      .exec();
  }

  async areFriends(userA: string, userB: string): Promise<boolean> {
    const relationship = await this.findRelationship(userA, userB);
    return relationship?.status === FriendshipStatus.ACCEPTED;
  }

  async findFriendIdsList({
    userId,
    limit,
    cursor,
  }: {
    userId: string;
    limit: number;
    cursor?: number;
  }) {
    const skip = cursor || 0;
    const userObjId = new Types.ObjectId(userId);

    const friendships = await this.friendshipModel
      .find({
        $or: [{ requester: userObjId }, { recipient: userObjId }],
        status: FriendshipStatus.ACCEPTED,
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('requester recipient')
      .lean()
      .exec();

    const friendIds = friendships.map((f) => {
      if (f.requester.toString() === userId) {
        return f.recipient.toString();
      }
      return f.requester.toString();
    });

    const nextCursor = friendships.length === limit ? skip + limit : null;

    return {
      friendIds,
      nextCursor,
    };
  }

  async findAllFriendIds(userId: string): Promise<string[]> {
    const userObjId = new Types.ObjectId(userId);

    const friendships = await this.friendshipModel
      .find({
        $or: [{ requester: userObjId }, { recipient: userObjId }],
        status: FriendshipStatus.ACCEPTED,
      })
      .select('requester recipient')
      .lean()
      .exec();

    return friendships.map((f) => {
      if (f.requester.toString() === userId) {
        return f.recipient.toString();
      }
      return f.requester.toString();
    });
  }

  async getPendingRequests(
    userId: string,
    limit: number,
    skip: number,
  ): Promise<FriendshipDocumentModelWithPopulatedUser<Types.ObjectId>[]> {
    return this.friendshipModel
      .find({
        recipient: new Types.ObjectId(userId),
        status: FriendshipStatus.PENDING,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('requester', 'firstName lastName username avatar')
      .lean()
      .exec() as unknown as Promise<
      FriendshipDocumentModelWithPopulatedUser<Types.ObjectId>[]
    >;
  }

  async getSentRequests(
    userId: string,
    limit: number,
    skip: number,
  ): Promise<FriendshipDocumentModelWithPopulatedUser<Types.ObjectId>[]> {
    return this.friendshipModel
      .find({
        requester: new Types.ObjectId(userId),
        status: FriendshipStatus.PENDING,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('recipient', 'firstName lastName username avatar')
      .lean()
      .exec() as unknown as Promise<
      FriendshipDocumentModelWithPopulatedUser<Types.ObjectId>[]
    >;
  }

  async getUnableFriendCandidates(userId: string): Promise<string[]> {
    const userObjId = new Types.ObjectId(userId);
    const results = await this.friendshipModel
      .aggregate([
        {
          $match: {
            $or: [{ requester: userObjId }, { recipient: userObjId }],
            status: {
              $in: [
                FriendshipStatus.PENDING,
                FriendshipStatus.ACCEPTED,
                FriendshipStatus.BLOCKED,
              ],
            },
          },
        },
        {
          $project: {
            otherUserId: {
              $cond: {
                if: { $eq: ['$requester', userObjId] },
                then: '$recipient',
                else: '$requester',
              },
            },
          },
        },
        {
          $group: {
            _id: '$otherUserId',
          },
        },
      ])
      .exec();

    const ids = results.map((r) => r._id.toString());
    ids.push(userId);

    return ids;
  }
  async createFriendRequest(
    requesterId: string,
    recipientId: string,
  ): Promise<FriendshipDocument> {
    const newFriendship = new this.friendshipModel({
      requester: new Types.ObjectId(requesterId),
      recipient: new Types.ObjectId(recipientId),
      status: FriendshipStatus.PENDING,
    });
    return newFriendship.save();
  }

  async acceptFriendRequest(
    requesterId: string,
    recipientId: string,
  ): Promise<FriendshipDocument | null> {
    return this.friendshipModel
      .findOneAndUpdate(
        {
          requester: new Types.ObjectId(requesterId),
          recipient: new Types.ObjectId(recipientId),
          status: FriendshipStatus.PENDING,
        },
        {
          $set: { status: FriendshipStatus.ACCEPTED },
        },
        { new: true },
      )
      .exec();
  }

  async removeFriendship(
    userA: string,
    userB: string,
  ): Promise<FriendshipDocument | null> {
    return this.friendshipModel
      .findOneAndDelete({
        $or: [
          {
            requester: new Types.ObjectId(userA),
            recipient: new Types.ObjectId(userB),
          },
          {
            requester: new Types.ObjectId(userB),
            recipient: new Types.ObjectId(userA),
          },
        ],
      })
      .exec();
  }

  async getMutualFriendsCandidates(
    userId: string,
    friendIds: string[],
    limit: number = 100,
  ): Promise<string[]> {
    const friendObjIds = friendIds.map((id) => new Types.ObjectId(id));
    const excludeIds = [new Types.ObjectId(userId), ...friendObjIds];

    const results = await this.friendshipModel
      .aggregate([
        {
          $match: {
            $or: [
              { requester: { $in: friendObjIds } },
              { recipient: { $in: friendObjIds } },
            ],
            status: FriendshipStatus.ACCEPTED,
          },
        },
        {
          $project: {
            otherUserId: {
              $cond: {
                if: { $in: ['$requester', friendObjIds] },
                then: '$recipient',
                else: '$requester',
              },
            },
          },
        },
        {
          $match: {
            otherUserId: { $nin: excludeIds },
          },
        },
        {
          $group: {
            _id: '$otherUserId',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 1 } },
      ])
      .exec();

    return results.map((r) => r._id.toString());
  }

  async findBlockedUsers({
    userId,
    limit,
    cursor,
  }: {
    userId: string;
    limit: number;
    cursor?: number;
  }) {
    const skip = cursor || 0;
    const userObjId = new Types.ObjectId(userId);

    const blockedFriendships = await this.friendshipModel
      .find({
        requester: userObjId,
        status: FriendshipStatus.BLOCKED,
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('recipient')
      .lean()
      .exec();

    const blockedUserIds = blockedFriendships.map((f) =>
      f.recipient.toString(),
    );
    const nextCursor =
      blockedFriendships.length === limit ? skip + limit : null;

    return {
      blockedUserIds,
      nextCursor,
    };
  }
}
