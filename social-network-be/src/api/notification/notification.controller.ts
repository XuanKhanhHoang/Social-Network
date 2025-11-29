import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { ParseMongoIdPipe } from 'src/share/pipe/parse-mongo-id-pipe';
import { GetNotificationsService } from 'src/use-case/notification/get-notifications/get-notifications.service';
import { MarkReadNotificationService } from 'src/use-case/notification/mark-read-notification/mark-read-notification.service';

import { CountUnreadNotificationsService } from 'src/use-case/notification/count-unread-notifications/count-unread-notifications.service';
import { MarkReadAllNotificationService } from 'src/use-case/notification/mark-read-all-notification/mark-read-all-notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getNotificationsService: GetNotificationsService,
    private readonly markReadNotificationService: MarkReadNotificationService,
    private readonly countUnreadNotificationsService: CountUnreadNotificationsService,
    private readonly markReadAllNotificationService: MarkReadAllNotificationService,
  ) {}

  @Get('unread')
  async getUnreadCount(@GetUserId() userId: string) {
    const count = await this.countUnreadNotificationsService.execute(userId);
    return { count };
  }

  @Get()
  async getNotifications(
    @GetUserId() userId: string,
    @Query('limit') limit: number = 20,
    @Query('cursor') cursor?: string,
  ) {
    return this.getNotificationsService.execute({
      userId,
      limit: Number(limit),
      cursor,
    });
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', new ParseMongoIdPipe()) id: string) {
    return this.markReadNotificationService.execute({ id });
  }
  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsReadForUser(@GetUserId() userId: string) {
    return this.markReadAllNotificationService.execute(userId);
  }
}
