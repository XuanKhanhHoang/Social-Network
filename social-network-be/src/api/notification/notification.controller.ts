import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { ParseMongoIdPipe } from 'src/share/pipe/parse-mongo-id-pipe';
import { GetNotificationsService } from 'src/use-case/notification/get-notifications/get-notifications.service';
import { MarkReadNotificationService } from 'src/use-case/notification/mark-read-notification/mark-read-notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getNotificationsService: GetNotificationsService,
    private readonly markReadNotificationService: MarkReadNotificationService,
  ) {}

  @Get()
  async getNotifications(
    @GetUserId() userId: string,
    @Query('limit') limit: number = 20,
    @Query('skip') skip: number = 0,
  ) {
    return this.getNotificationsService.execute({
      userId,
      limit: Number(limit),
      skip: Number(skip),
    });
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', new ParseMongoIdPipe()) id: string) {
    return this.markReadNotificationService.execute({ id });
  }
}
