import { Module } from '@nestjs/common';
import { UserModule } from 'src/domains/user/user.module';
import { UpdateUserIpLocationService } from './update-user-ip-location/update-user-ip-location.service';
import { IpLocationTrackingModule } from 'src/domains/ip-location-tracking/ip-location-tracking.module';

@Module({
  imports: [UserModule, IpLocationTrackingModule],
  providers: [UpdateUserIpLocationService],
  exports: [UpdateUserIpLocationService],
})
export class IpLocationTrackingUseCaseModule {}
