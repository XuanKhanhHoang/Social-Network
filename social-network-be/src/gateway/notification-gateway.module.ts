import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { IpLocationTrackingUseCaseModule } from '../use-case/ip-location-tracking/ip-location-tracking-use-case-module.module';

@Module({
  imports: [IpLocationTrackingUseCaseModule],
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationGatewayModule {}
