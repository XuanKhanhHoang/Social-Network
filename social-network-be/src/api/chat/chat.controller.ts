import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SendMessageDto } from 'src/domains/chat/dto/send-message.dto';
import { SendMessageService } from 'src/use-case/chat/send-message/send-message.service';
import { GetConversationsService } from 'src/use-case/chat/get-conversations/get-conversations.service';
import { GetMessagesService } from 'src/use-case/chat/get-messages/get-messages.service';
import { CursorPaginationQueryDto } from 'src/share/dto/req/cursor-pagination-query.dto';
import { CursorPaginationWithSearchQueryDto } from 'src/share/dto/req/cursor-pagination-with-search-query.dto';
import { GetSuggestedMessagingUsersService } from 'src/use-case/chat/get-suggested-messaging-users/get-suggested-messaging-users.service';
import { SearchMessagingUsersService } from 'src/use-case/chat/search-messaging-users/search-messaging-users.service';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { GetConversationByUserService } from 'src/use-case/chat/get-conversation-by-user/get-conversation-by-user.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly sendMessageService: SendMessageService,
    private readonly getConversationsService: GetConversationsService,
    private readonly getMessagesService: GetMessagesService,
    private readonly getSuggestedMessagingUsersService: GetSuggestedMessagingUsersService,
    private readonly searchMessagingUsersService: SearchMessagingUsersService,
    private readonly getConversationByUserService: GetConversationByUserService,
  ) {}

  @Post('message')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 200 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only images are allowed'), false);
        }
      },
    }),
  )
  async sendMessage(
    @GetUserId() senderId: string,
    @Body() dto: SendMessageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.sendMessageService.execute({
      senderId,
      dto,
      file,
    });
  }

  @Get('conversations')
  async getConversations(
    @GetUserId() userId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.getConversationsService.execute({
      userId,
      ...query,
    });
  }

  @Get('messages/:conversationId')
  async getMessages(
    @GetUserId() userId: string,
    @Param('conversationId') conversationId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.getMessagesService.execute({
      conversationId,
      currentUserId: userId,
      ...query,
    });
  }
  @Get('suggested')
  async getSuggestedUsers(
    @GetUserId() userId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.getSuggestedMessagingUsersService.execute({
      currentUserId: userId,
      ...query,
    });
  }

  @Get('search-user')
  async searchUsers(
    @GetUserId() userId: string,
    @Query() query: CursorPaginationWithSearchQueryDto,
  ) {
    return this.searchMessagingUsersService.execute({
      currentUserId: userId,
      ...query,
    });
  }

  @Get('recipient/:recipientId')
  async getConversationByRecipient(
    @GetUserId() userId: string,
    @Param('recipientId') recipientId: string,
  ) {
    return this.getConversationByUserService.execute({
      currentUserId: userId,
      targetUserId: recipientId,
    });
  }
}
