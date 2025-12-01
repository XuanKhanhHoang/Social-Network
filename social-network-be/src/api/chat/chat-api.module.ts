import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatUseCaseModule } from 'src/use-case/chat/chat-use-case.module';

@Module({
  imports: [ChatUseCaseModule],
  controllers: [ChatController],
})
export class ChatApiModule {}
