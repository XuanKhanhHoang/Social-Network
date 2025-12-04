import { Module } from '@nestjs/common';
import { ReportModule } from 'src/domains/report/report.module';
import { UserModule } from 'src/domains/user/user.module';
import { SubmitReportService } from './submit-report/submit-report.service';

@Module({
  imports: [ReportModule, UserModule],
  providers: [SubmitReportService],
  exports: [SubmitReportService],
})
export class ReportUseCaseModule {}
