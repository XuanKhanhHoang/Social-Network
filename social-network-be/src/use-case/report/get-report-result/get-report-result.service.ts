import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ReportRepository } from 'src/domains/report/report.repository';
import { ReportTargetType } from 'src/schemas/report.schema';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type GetReportResultInput = {
  reportId: string;
  userId: string;
};

export type GetReportResultOutput = {
  _id: string;
  targetType: ReportTargetType;
  status: string;
  createdAt: Date;
  reviewedAt?: Date;
};

@Injectable()
export class GetReportResultService extends BaseUseCaseService<
  GetReportResultInput,
  GetReportResultOutput
> {
  constructor(private readonly reportRepository: ReportRepository) {
    super();
  }

  async execute(input: GetReportResultInput): Promise<GetReportResultOutput> {
    const { reportId, userId } = input;

    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.reporter._id.toString() !== userId) {
      throw new ForbiddenException('You can only view your own reports');
    }

    return {
      _id: report._id.toString(),
      targetType: report.targetType,
      status: report.status,
      createdAt: report.createdAt,
      reviewedAt: report.reviewedAt,
    };
  }
}
