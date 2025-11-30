import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationSchema } from 'src/schemas/conversation.schema';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
    ]),
  ],
  providers: [ChatRepository],
  exports: [ChatRepository],
})
export class ChatModule {}
