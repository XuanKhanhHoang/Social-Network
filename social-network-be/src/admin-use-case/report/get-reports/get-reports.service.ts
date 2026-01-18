import { Injectable } from '@nestjs/common';
import { ReportRepository } from 'src/domains/report/report.repository';
import { ReportStatus, ReportTargetType } from 'src/schemas/report.schema';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { PaginatedResponse } from 'src/share/dto/pagination.dto';

export type GetReportsInput = {
  page: number;
  limit: number;
  targetType?: ReportTargetType;
  status?: ReportStatus;
};

export type ReportListItem = {
  _id: string;
  reporter: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: any;
  };
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  hasAppealed?: boolean;
  appealReason?: string;
  appealedAt?: Date;
  createdAt: Date;
};

export type GetReportsOutput = PaginatedResponse<ReportListItem>;

@Injectable()
export class GetReportsService extends BaseUseCaseService<
  GetReportsInput,
  GetReportsOutput
> {
  constructor(private readonly reportRepository: ReportRepository) {
    super();
  }

  async execute(input: GetReportsInput): Promise<GetReportsOutput> {
    const { page, limit, targetType, status } = input;

    const { data: reports, total } = await this.reportRepository.findForAdmin({
      page,
      limit,
      targetType,
      status,
    });

    return {
      data: reports.map((report) => ({
        _id: report._id.toString(),
        reporter: {
          _id: report.reporter._id.toString(),
          username: report.reporter.username,
          firstName: report.reporter.firstName,
          lastName: report.reporter.lastName,
          avatar: report.reporter.avatar,
        },
        targetType: report.targetType,
        targetId: report.targetId.toString(),
        reason: report.reason,
        status: report.status,
        adminNote: report.adminNote,
        reviewedBy: report.reviewedBy?.toString(),
        reviewedAt: report.reviewedAt,
        hasAppealed: report.hasAppealed,
        appealReason: report.appealReason,
        appealedAt: report.appealedAt,
        createdAt: report.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
