import { Injectable } from '@nestjs/common';
import { ConversationDocument } from 'src/schemas/conversation.schema';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type GetConversationByUserInput = {
  currentUserId: string;
  targetUserId: string;
};
export type GetConversationByUserOutput = ConversationDocument;

@Injectable()
export class GetConversationByUserService extends BaseUseCaseService<
  GetConversationByUserInput,
  GetConversationByUserOutput
> {
  constructor(private readonly chatRepository: ChatRepository) {
    super();
  }

  async execute(
    input: GetConversationByUserInput,
  ): Promise<GetConversationByUserOutput> {
    const { currentUserId, targetUserId } = input;

    let conversation = await this.chatRepository.findConversation([
      currentUserId,
      targetUserId,
    ]);

    if (!conversation) {
      conversation = await this.chatRepository.createConversation([
        currentUserId,
        targetUserId,
      ]);
    }

    return conversation;
  }
}
