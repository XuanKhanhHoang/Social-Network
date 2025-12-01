import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRepository } from './chat.repository';
import { ConversationSchema } from 'src/schemas/conversation.schema';
import { MessageSchema } from 'src/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
      { name: 'Message', schema: MessageSchema },
    ]),
  ],
  providers: [ChatRepository],
  exports: [ChatRepository],
})
export class ChatModule {}
