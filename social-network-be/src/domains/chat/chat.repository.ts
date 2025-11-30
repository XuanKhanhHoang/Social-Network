import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/share/base-class/base-repository.service';
import { ConversationDocument } from 'src/schemas/conversation.schema';

@Injectable()
export class ChatRepository extends BaseRepository<ConversationDocument> {
  constructor(
    @InjectModel('Conversation')
    private readonly conversationModel: Model<ConversationDocument>,
  ) {
    super(conversationModel);
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
