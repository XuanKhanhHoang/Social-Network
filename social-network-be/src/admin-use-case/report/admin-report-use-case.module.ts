import { Module } from '@nestjs/common';
import { UserModule } from 'src/domains/user/user.module';
import { PostModule } from 'src/domains/post/post.module';
import { CommentModule } from 'src/domains/comment/comment.module';
import { ReportModule } from 'src/domains/report/report.module';
import { GetReportsService } from './get-reports/get-reports.service';
import { UpdateReportStatusService } from './update-report-status/update-report-status.service';
import { GetReportTargetService } from './get-report-target/get-report-target.service';

@Module({
  imports: [UserModule, PostModule, CommentModule, ReportModule],
  providers: [
    GetReportsService,
    UpdateReportStatusService,
    GetReportTargetService,
  ],
  exports: [
    GetReportsService,
    GetReportsService,
    UpdateReportStatusService,
    GetReportTargetService,
  ],
})
export class AdminReportUseCaseModule {}
