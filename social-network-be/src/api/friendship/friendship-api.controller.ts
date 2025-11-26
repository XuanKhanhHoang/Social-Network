import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { CursorPaginationQueryDto } from 'src/share/dto/req/cursor-pagination-query.dto';
import {
  AcceptFriendRequestService,
  SendFriendRequestService,
  RemoveFriendService,
  GetBlockedUsersService,
  GetReceiveFriendRequestsService,
  GetSentFriendRequestsService,
  CancelFriendRequestService,
} from 'src/use-case/friendship';
import { AcceptFriendRequestDto, SendFriendRequestDto } from './dto';
import { GetSuggestFriendsService } from 'src/use-case/user';

@Controller('friendships')
export class FriendshipApiController {
  constructor(
    private readonly sendFriendRequestService: SendFriendRequestService,
    private readonly acceptFriendRequestService: AcceptFriendRequestService,
    private readonly removeFriendService: RemoveFriendService,
    private readonly getReceiveFriendRequestsService: GetReceiveFriendRequestsService,
    private readonly getSuggestedFriendsService: GetSuggestFriendsService,
    private readonly getSentFriendRequestsService: GetSentFriendRequestsService,
    private readonly getBlockedUsersService: GetBlockedUsersService,
    private readonly cancelFriendRequestService: CancelFriendRequestService,
  ) {}

  @Post('request')
  async sendFriendRequest(
    @GetUserId() userId: string,
    @Body() body: SendFriendRequestDto,
  ) {
    return this.sendFriendRequestService.execute({
      requesterId: userId,
      recipientId: body.recipientId,
    });
  }

  @Post('accept')
  async acceptFriendRequest(
    @GetUserId() userId: string,
    @Body() body: AcceptFriendRequestDto,
  ) {
    return this.acceptFriendRequestService.execute({
      recipientId: userId,
      requesterId: body.requesterId,
    });
  }

  @Delete('remove/:targetUserId')
  async removeFriend(
    @GetUserId() userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.removeFriendService.execute({
      userId,
      targetUserId,
    });
  }

  @Delete('cancel/:targetUserId')
  async cancelFriendRequest(
    @GetUserId() userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.cancelFriendRequestService.execute({
      userId,
      targetUserId,
    });
  }

  @Delete('deny/:targetUserId')
  async denyFriendRequest(
    @GetUserId() userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.cancelFriendRequestService.execute({
      userId,
      targetUserId,
    });
  }

  @Get('requests/received')
  async getReceivedRequests(
    @GetUserId() userId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const { limit, cursor: cursorStr } = query;
    const cursorN = cursorStr ? Number(cursorStr) : undefined;
    const cursor = isNaN(cursorN) ? undefined : cursorN;

    return this.getReceiveFriendRequestsService.execute({
      userId,
      limit,
      cursor,
    });
  }

  @Get('requests/sent')
  async getSentRequests(
    @GetUserId() userId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const { limit, cursor: cursorStr } = query;
    const cursorN = cursorStr ? Number(cursorStr) : undefined;
    const cursor = isNaN(cursorN) ? undefined : cursorN;

    return this.getSentFriendRequestsService.execute({
      userId,
      limit,
      cursor,
    });
  }

  @Get('suggested')
  async getSuggestedFriends(
    @GetUserId() userId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const { limit, cursor } = query;
    return this.getSuggestedFriendsService.execute({
      userId,
      limit,
      cursor,
    });
  }

  @Get('blocked')
  async getBlockedUsers(
    @GetUserId() userId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const { limit, cursor: cursorStr } = query;
    const cursorN = cursorStr ? Number(cursorStr) : undefined;
    const cursor = isNaN(cursorN) ? undefined : cursorN;

    return this.getBlockedUsersService.execute({
      userId,
      limit,
      cursor,
    });
  }
}
