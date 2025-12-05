import { ConflictException, Injectable } from '@nestjs/common';
import { ReportRepository } from 'src/domains/report/report.repository';
import { UserRepository } from 'src/domains/user/user.repository';
import { UserDocument } from 'src/schemas';
import { ReportTargetType } from 'src/schemas/report.schema';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type SubmitReportInput = {
  userId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
};

export type SubmitReportOutput = {
  _id: string;
  message: string;
};

@Injectable()
export class SubmitReportService extends BaseUseCaseService<
  SubmitReportInput,
  SubmitReportOutput
> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async execute(input: SubmitReportInput): Promise<SubmitReportOutput> {
    const { userId, targetType, targetId, reason } = input;

    const isDuplicate = await this.reportRepository.checkDuplicateReport(
      userId,
      targetType,
      targetId,
    );

    if (isDuplicate) {
      throw new ConflictException('Report already exists');
    }
    const user = await this.userRepository.findLeanedById<UserDocument>(userId);

    const reporter = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar?.url || null,
    } as any;

    const report = await this.reportRepository.create({
      reporter,
      targetType,
      targetId,
      reason,
    });

    return {
      _id: report._id.toString(),
      message: 'Report submitted successfully',
    };
  }
}
