import { Module } from '@nestjs/common';
import { UserModule } from 'src/domains/user/user.module';
import { GetRegistrationStatsService } from './get-registration-stats/get-registration-stats.service';

@Module({
  imports: [UserModule],
  providers: [GetRegistrationStatsService],
  exports: [GetRegistrationStatsService],
})
export class AdminReportUseCaseModule {}
