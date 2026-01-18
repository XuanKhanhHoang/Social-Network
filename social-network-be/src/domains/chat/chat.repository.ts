import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  BaseQueryOptions,
  BaseRepository,
} from 'src/share/base-class/base-repository.service';
import {
  ConversationDocument,
  ConversationType,
} from 'src/schemas/conversation.schema';
import { MessageDocument } from 'src/schemas/message.schema';
import { SearchConversationsWithPaginationResults } from './interfaces/search-conversations-result.interface';

@Injectable()
export class ChatRepository extends BaseRepository<ConversationDocument> {
  constructor(
    @InjectModel('Conversation')
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel('Message')
    private readonly messageModel: Model<MessageDocument>,
  ) {
    super(conversationModel);
  }

  async findConversation(
    participantIds: string[],
  ): Promise<ConversationDocument | null> {
    return this.conversationModel.findOne({
      type: ConversationType.PRIVATE,
      'participants.user': {
        $all: participantIds.map((id) => new Types.ObjectId(id)),
      },
      participants: { $size: 2 },
    });
  }

  async createConversation(
    participantIds: string[],
  ): Promise<ConversationDocument> {
    const now = new Date();
    const participants = participantIds.map((id) => ({
      user: new Types.ObjectId(id),
      joinedAt: now,
    }));
    const conversation = new this.conversationModel({
      type: ConversationType.PRIVATE,
      participants,
      lastInteractiveAt: now,
    });
    return conversation.save();
  }

  async createGroupConversation(data: {
    name: string;
    avatar?: string;
    createdBy: string;
    participantIds: string[];
  }): Promise<ConversationDocument> {
    const now = new Date();
    const participants = data.participantIds.map((id) => ({
      user: new Types.ObjectId(id),
      joinedAt: now,
    }));
    return new this.conversationModel({
      type: ConversationType.GROUP,
      name: data.name,
      avatar: data.avatar,
      createdBy: new Types.ObjectId(data.createdBy),
      owner: new Types.ObjectId(data.createdBy),
      participants,
      lastInteractiveAt: now,
    }).save();
  }

  async addGroupMembers(
    conversationId: string,
    memberIds: string[],
  ): Promise<ConversationDocument | null> {
    const now = new Date();
    const newParticipants = memberIds.map((id) => ({
      user: new Types.ObjectId(id),
      joinedAt: now,
    }));
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      { $push: { participants: { $each: newParticipants } } },
      { new: true },
    );
  }

  async removeGroupMember(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      { $pull: { participants: { user: new Types.ObjectId(userId) } } },
      { new: true },
    );
  }

  async updateGroupInfo(
    conversationId: string,
    data: { name?: string; avatar?: string },
  ): Promise<ConversationDocument | null> {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      { $set: data },
      { new: true },
    );
  }

  async updateGroupOwner(
    conversationId: string,
    newOwnerId: string,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      { owner: new Types.ObjectId(newOwnerId) },
      { new: true },
    );
  }

  async deleteConversation(
    conversationId: string,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel.findByIdAndDelete(conversationId);
  }

  async getGroupWithMembers(
    conversationId: string,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel.findById(conversationId).populate({
      path: 'participants.user',
      select: 'firstName lastName username avatar publicKey',
    });
  }

  async createMessage(data: any): Promise<MessageDocument> {
    const message = new this.messageModel(data);
    return message.save();
  }

  async findMessageById(id: string): Promise<MessageDocument | null> {
    return this.messageModel.findById(id).exec();
  }

  async findMessages(
    query: FilterQuery<MessageDocument>,
    options?: BaseQueryOptions<MessageDocument>,
  ): Promise<MessageDocument[] | null> {
    return this.messageModel.find(query).exec();
  }
  async updateConversation(
    id: string,
    update: any,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
  }

  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<{
    data: MessageDocument[];
    pagination: { nextCursor: string | null; hasMore: boolean };
  }> {
    const conversation = await this.conversationModel.findById(conversationId);
    const participant = conversation?.participants.find(
      (p) => p.user.toString() === userId,
    );
    const joinedAt = participant?.joinedAt || new Date(0);

    const query: any = {
      conversationId: new Types.ObjectId(conversationId),
      createdAt: { $gte: joinedAt },
    };

    if (cursor) {
      query.createdAt = { $gte: joinedAt, $lt: new Date(cursor) };
    }

    const messages = await this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate({
        path: 'sender',
        select: 'firstName lastName username avatar',
        match: { deletedAt: null },
      })
      .exec();

    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor =
      hasMore && data.length > 0
        ? data[data.length - 1].createdAt.toISOString()
        : null;

    return {
      data,
      pagination: {
        nextCursor,
        hasMore,
      },
    };
  }

  async getConversations(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<{
    data: ConversationDocument[];
    pagination: { nextCursor: string | null; hasMore: boolean };
  }> {
    const query: any = { 'participants.user': new Types.ObjectId(userId) };

    if (cursor) {
      query.lastInteractiveAt = { $lt: new Date(cursor) };
    }

    const conversations = await this.conversationModel
      .find(query)
      .sort({ lastInteractiveAt: -1 })
      .limit(limit + 1)
      .populate({
        path: 'participants.user',
        select: 'firstName lastName username avatar publicKey',
        match: { deletedAt: null },
      })
      .populate('lastMessage')
      .exec();

    const hasMore = conversations.length > limit;
    const data = hasMore ? conversations.slice(0, limit) : conversations;
    const nextCursor =
      hasMore && data.length > 0
        ? data[data.length - 1].lastInteractiveAt.toISOString()
        : null;

    return {
      data,
      pagination: {
        nextCursor,
        hasMore,
      },
    };
  }
  async findRecentConversations(
    userId: string,
  ): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ 'participants.user': new Types.ObjectId(userId) })
      .sort({ lastInteractiveAt: -1 })
      .limit(100)
      .populate({
        path: 'participants.user',
        select: 'firstName lastName username avatar lastActiveAt',
        match: { deletedAt: null },
      })
      .exec();
  }

  async searchConversations(
    userId: string,
    keyword?: string,
  ): Promise<ConversationDocument[]> {
    if (!keyword || !keyword.trim()) {
      return this.conversationModel
        .find({ 'participants.user': new Types.ObjectId(userId) })
        .populate(
          'participants.user',
          'firstName lastName username avatar lastActiveAt',
        )
        .sort({ updatedAt: -1 })
        .limit(100)
        .exec();
    }
    const searchRegex = new RegExp(keyword, 'i');
    return this.conversationModel
      .find({ 'participants.user': new Types.ObjectId(userId) })
      .populate({
        path: 'participants',
        match: {
          $or: [
            { firstName: { $regex: searchRegex } },
            { lastName: { $regex: searchRegex } },
          ],
        },
        select: 'firstName lastName username avatar lastActiveAt',
      })
      .limit(100)
      .exec();
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await this.messageModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId },
      },
    );
  }

  async searchConversationsWithPagination(
    userId: string,
    keyword?: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<{
    data: SearchConversationsWithPaginationResults[];
    pagination: { nextCursor: string | null; hasMore: boolean };
  }> {
    const userObjectId = new Types.ObjectId(userId);

    const pipeline: any[] = [
      { $match: { 'participants.user': userObjectId } },
      {
        $lookup: {
          from: 'users',
          localField: 'participants.user',
          foreignField: '_id',
          as: 'participants',
          pipeline: [
            { $match: { deletedAt: null } },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                username: 1,
                avatar: 1,
                publicKey: 1,
              },
            },
          ],
        },
      },
    ];

    if (keyword) {
      const searchRegex = new RegExp(keyword, 'i');

      pipeline.push({
        $match: {
          participants: {
            $elemMatch: {
              _id: { $ne: userObjectId },
              $or: [
                { firstName: { $regex: searchRegex } },
                { lastName: { $regex: searchRegex } },
                { username: { $regex: searchRegex } },
              ],
            },
          },
        },
      });
    }
    pipeline.push(
      ...[
        { $sort: { lastInteractiveAt: -1 } },
        ...(cursor
          ? [{ $match: { lastInteractiveAt: { $lt: new Date(cursor) } } }]
          : []),

        { $limit: limit + 1 },

        {
          $lookup: {
            from: 'messages',
            localField: 'lastMessage',
            foreignField: '_id',
            as: 'lastMessage',
          },
        },
        {
          $unwind: {
            path: '$lastMessage',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'users',
            localField: 'lastMessage.sender',
            foreignField: '_id',
            as: 'lastMessage.sender',
            pipeline: [
              { $match: { deletedAt: null } },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  username: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$lastMessage.sender',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $addFields: {
            hasRead: {
              $cond: {
                if: {
                  $or: [
                    { $not: ['$lastMessage'] },
                    { $not: ['$lastMessage._id'] },
                  ],
                },
                then: true,
                else: {
                  $or: [
                    { $eq: ['$lastMessage.sender._id', userObjectId] },
                    {
                      $in: [
                        userObjectId,
                        { $ifNull: ['$lastMessage.readBy', []] },
                      ],
                    },
                  ],
                },
              },
            },
            lastMessage: {
              $cond: {
                if: {
                  $or: [
                    { $not: ['$lastMessage'] },
                    { $not: ['$lastMessage._id'] },
                  ],
                },
                then: null,
                else: '$lastMessage',
              },
            },
          },
        },
      ],
    );

    const conversations = await this.conversationModel
      .aggregate(pipeline)
      .exec();

    const hasMore = conversations.length > limit;
    const data = hasMore ? conversations.slice(0, limit) : conversations;
    const nextCursor =
      hasMore && data.length > 0
        ? data[data.length - 1].lastInteractiveAt.toISOString()
        : null;

    return {
      data,
      pagination: {
        nextCursor,
        hasMore,
      },
    };
  }

  async checkUnreadMessages(userId: string): Promise<boolean> {
    const conversations = (await this.searchConversations(userId))
      .map((c) => c.lastMessage || null)
      .filter((c) => !!c);
    const unreadMessage = await this.messageModel
      .findOne({
        _id: { $in: conversations },
        readBy: { $ne: userId },
        sender: { $ne: userId },
      })
      .select('_id')
      .lean();

    return !!unreadMessage;
  }
}
