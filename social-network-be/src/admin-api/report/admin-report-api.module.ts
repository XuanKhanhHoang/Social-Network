import { Module } from '@nestjs/common';
import { AdminReportApiController } from './admin-report-api.controller';
import { AdminReportUseCaseModule } from 'src/admin-use-case/report/admin-report-use-case.module';

@Module({
  imports: [AdminReportUseCaseModule],
  controllers: [AdminReportApiController],
})
export class AdminReportApiModule {}
