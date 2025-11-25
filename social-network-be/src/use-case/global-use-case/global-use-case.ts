import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from 'src/domains/auth/auth.module';
import { UserModule } from 'src/domains/user/user.module';
import { IpLocationTrackingUseCaseModule } from '../ip-location-tracking/ip-location-tracking-use-case-module.module';
import { IpLocationInterceptor } from 'src/others/interceptors/ip-location-tracking.interceptor';
import { JwtAuthGuard } from 'src/others/guards/jwt-auth.guard';

@Module({
  imports: [IpLocationTrackingUseCaseModule, UserModule, AuthModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IpLocationInterceptor,
    },
  ],
  exports: [IpLocationTrackingUseCaseModule],
})
export class GlobalUseCaseModule {}
