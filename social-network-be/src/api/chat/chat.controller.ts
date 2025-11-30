import { Controller, Get, Query, Req } from '@nestjs/common';
import { GetSuggestedMessagingUsersService } from 'src/use-case/chat/get-suggested-messaging-users/get-suggested-messaging-users.service';
import { SearchMessagingUsersService } from 'src/use-case/chat/search-messaging-users/search-messaging-users.service';
import { CursorPaginationQueryDto } from 'src/share/dto/req/cursor-pagination-query.dto';
import { CursorPaginationWithSearchQueryDto } from 'src/share/dto/req/cursor-pagination-with-search-query.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly getSuggestedMessagingUsersService: GetSuggestedMessagingUsersService,
    private readonly searchMessagingUsersService: SearchMessagingUsersService,
  ) {}

  @Get('suggested')
  async getSuggestedUsers(
    @Req() req: any,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.getSuggestedMessagingUsersService.execute({
      currentUserId: req.user._id,
      ...query,
    });
  }

  @Get('search')
  async searchUsers(
    @Req() req: any,
    @Query() query: CursorPaginationWithSearchQueryDto,
  ) {
    return this.searchMessagingUsersService.execute({
      currentUserId: req.user._id,
      ...query,
    });
  }
}
