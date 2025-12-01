import { Module, Global } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { IpLocationTrackingUseCaseModule } from '../use-case/ip-location-tracking/ip-location-tracking-use-case-module.module';

@Global()
@Module({
  imports: [IpLocationTrackingUseCaseModule],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
