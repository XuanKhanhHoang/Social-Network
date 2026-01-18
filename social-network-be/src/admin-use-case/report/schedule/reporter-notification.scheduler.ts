import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportRepository } from 'src/domains/report/report.repository';
import { CreateNotificationService } from 'src/use-case/notification/create-notification/create-notification.service';
import { NotificationType } from 'src/share/enums';

@Injectable()
export class ReporterNotificationScheduler {
  private readonly logger = new Logger(ReporterNotificationScheduler.name);

  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly createNotificationService: CreateNotificationService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async processScheduledReporterNotifications(): Promise<void> {
    const pendingNotifications =
      await this.reportRepository.findPendingReporterNotifications();

    if (pendingNotifications.length === 0) {
      return;
    }

    this.logger.log(
      `Processing ${pendingNotifications.length} reporter notifications`,
    );

    for (const report of pendingNotifications) {
      try {
        const isViolation = report.status === 'resolved';
        const message = isViolation
          ? 'Cảm ơn bạn đã báo cáo. Nội dung vi phạm đã được xử lý.'
          : 'Báo cáo của bạn đã được xem xét. Không phát hiện vi phạm.';

        await this.createNotificationService.execute({
          receiver: report.reporter._id.toString(),
          type: NotificationType.REPORT_RESULT,
          relatedId: report._id.toString(),
          relatedModel: 'Report',
          message,
          metadata: {
            status: report.status,
            targetType: report.targetType,
          },
        });

        await this.reportRepository.markReporterNotified(report._id.toString());

        this.logger.log(`Sent notification for report ${report._id}`);
      } catch (error) {
        this.logger.error(
          `Failed to send notification for report ${report._id}:`,
          error,
        );
      }
    }
  }
}
