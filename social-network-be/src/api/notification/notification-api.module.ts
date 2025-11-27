import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationUseCaseModule } from 'src/use-case/notification/notification.use-case.module';

@Module({
  imports: [NotificationUseCaseModule],
  controllers: [NotificationController],
})
export class NotificationApiModule {}
