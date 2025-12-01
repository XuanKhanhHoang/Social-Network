import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from 'src/share/base-class/base-repository.service';
import { ConversationDocument } from 'src/schemas/conversation.schema';
import { MessageDocument } from 'src/schemas/message.schema';

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
    participants: string[],
  ): Promise<ConversationDocument | null> {
    return this.conversationModel.findOne({
      participants: { $all: participants },
    });
  }

  async createConversation(
    participants: string[],
  ): Promise<ConversationDocument> {
    const conversation = new this.conversationModel({
      participants,
      lastInteractiveAt: new Date(),
    });
    return conversation.save();
  }

  async createMessage(data: any): Promise<MessageDocument> {
    const message = new this.messageModel(data);
    return message.save();
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
    cursor?: string,
    limit: number = 20,
  ): Promise<{
    data: MessageDocument[];
    pagination: { nextCursor: string | null; hasMore: boolean };
  }> {
    const query: any = { conversationId: new Types.ObjectId(conversationId) };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
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
    const query: any = { participants: userId };

    if (cursor) {
      query.lastInteractiveAt = { $lt: new Date(cursor) };
    }

    const conversations = await this.conversationModel
      .find(query)
      .sort({ lastInteractiveAt: -1 })
      .limit(limit + 1)
      .populate('participants', 'firstName lastName username avatar publicKey')
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
      .find({ participants: userId })
      .sort({ lastInteractiveAt: -1 })
      .limit(100)
      .populate({
        path: 'participants',
        select: 'firstName lastName username avatar lastActiveAt',
      })
      .exec();
  }

  async searchConversations(
    userId: string,
    keyword?: string,
  ): Promise<ConversationDocument[]> {
    if (!keyword || !keyword.trim()) {
      return this.conversationModel
        .find({ participants: userId })
        .populate(
          'participants',
          'firstName lastName username avatar lastActiveAt',
        )
        .sort({ updatedAt: -1 })
        .limit(100)
        .exec();
    }
    const searchRegex = new RegExp(keyword, 'i');
    return this.conversationModel
      .find({ participants: userId })
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
}
