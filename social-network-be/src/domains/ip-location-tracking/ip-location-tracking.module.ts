import { Module } from '@nestjs/common';
import { IpLocationTrackingService } from './ip-location-tracking.service';

@Module({
  providers: [IpLocationTrackingService],
  exports: [IpLocationTrackingService],
})
export class IpLocationTrackingModule {}
