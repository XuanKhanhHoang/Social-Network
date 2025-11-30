import { Module } from '@nestjs/common';
import { ChatUseCaseModule } from 'src/use-case/chat/chat-use-case.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [ChatUseCaseModule],
  controllers: [ChatController],
})
export class ChatApiModule {}
