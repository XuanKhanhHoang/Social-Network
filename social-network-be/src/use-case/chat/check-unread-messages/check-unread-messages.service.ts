import { Injectable } from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type CheckUnreadMessagesInput = {
  userId: string;
};

export type CheckUnreadMessagesOutput = {
  hasUnread: boolean;
};

@Injectable()
export class CheckUnreadMessagesService extends BaseUseCaseService<
  CheckUnreadMessagesInput,
  CheckUnreadMessagesOutput
> {
  constructor(private readonly chatRepository: ChatRepository) {
    super();
  }

  async execute(
    input: CheckUnreadMessagesInput,
  ): Promise<CheckUnreadMessagesOutput> {
    const hasUnread = await this.chatRepository.checkUnreadMessages(
      input.userId,
    );
    return { hasUnread };
  }
}
