import { Module } from '@nestjs/common';
import { UserModule } from 'src/domains/user/user.module';
import { PostModule } from 'src/domains/post/post.module';
import { CommentModule } from 'src/domains/comment/comment.module';
import { ReportModule } from 'src/domains/report/report.module';
import { NotificationUseCaseModule } from 'src/use-case/notification/notification.use-case.module';
import { GetReportsService } from './get-reports/get-reports.service';
import { UpdateReportStatusService } from './update-report-status/update-report-status.service';
import { GetReportTargetService } from './get-report-target/get-report-target.service';
import { ReverseReportDecisionService } from './reverse-report-decision/reverse-report-decision.service';
import { ReporterNotificationScheduler } from './schedule/reporter-notification.scheduler';
import { ResolveAppealService } from './resolve-appeal/resolve-appeal.service';

@Module({
  imports: [
    UserModule,
    PostModule,
    CommentModule,
    ReportModule,
    NotificationUseCaseModule,
  ],
  providers: [
    GetReportsService,
    UpdateReportStatusService,
    GetReportTargetService,
    ReverseReportDecisionService,
    ReporterNotificationScheduler,
    ResolveAppealService,
  ],
  exports: [
    GetReportsService,
    UpdateReportStatusService,
    GetReportTargetService,
    ReverseReportDecisionService,
    ResolveAppealService,
  ],
})
export class AdminReportUseCaseModule {}
