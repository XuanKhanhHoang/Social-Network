import { Module } from '@nestjs/common';
import { UserModule } from 'src/domains/user/user.module';
import { PostModule } from 'src/domains/post/post.module';
import { CommentModule } from 'src/domains/comment/comment.module';
import { ReportModule } from 'src/domains/report/report.module';
import { GetRegistrationStatsService } from './get-registration-stats/get-registration-stats.service';
import { GetReportsService } from './get-reports/get-reports.service';
import { UpdateReportStatusService } from './update-report-status/update-report-status.service';

@Module({
  imports: [UserModule, PostModule, CommentModule, ReportModule],
  providers: [
    GetRegistrationStatsService,
    GetReportsService,
    UpdateReportStatusService,
  ],
  exports: [
    GetRegistrationStatsService,
    GetReportsService,
    UpdateReportStatusService,
  ],
})
export class AdminReportUseCaseModule {}
