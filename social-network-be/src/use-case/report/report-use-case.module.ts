import { Module } from '@nestjs/common';
import { ReportModule } from 'src/domains/report/report.module';
import { UserModule } from 'src/domains/user/user.module';
import { PostModule } from 'src/domains/post/post.module';
import { CommentModule } from 'src/domains/comment/comment.module';
import { SubmitReportService } from './submit-report/submit-report.service';
import { GetReportByIdService } from './get-report-by-id/get-report-by-id.service';
import { GetReportResultService } from './get-report-result/get-report-result.service';
import { SubmitAppealService } from './submit-appeal/submit-appeal.service';

@Module({
  imports: [ReportModule, UserModule, PostModule, CommentModule],
  providers: [
    SubmitReportService,
    GetReportByIdService,
    GetReportResultService,
    SubmitAppealService,
  ],
  exports: [
    SubmitReportService,
    GetReportByIdService,
    GetReportResultService,
    SubmitAppealService,
  ],
})
export class ReportUseCaseModule {}
