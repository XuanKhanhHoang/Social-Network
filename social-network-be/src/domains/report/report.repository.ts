import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ReportDocument,
  ReportStatus,
  ReportTargetType,
} from 'src/schemas/report.schema';
import { SubUser } from 'src/schemas/sub-user.schema';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectModel('Report')
    private readonly reportModel: Model<ReportDocument>,
  ) {}

  async create(data: {
    reporter: SubUser;
    targetType: ReportTargetType;
    targetId: string;
    reason: string;
  }): Promise<ReportDocument> {
    const report = new this.reportModel({
      reporter: {
        ...data.reporter,
        _id: new Types.ObjectId(data.reporter._id as unknown as string),
      },
      targetType: data.targetType,
      targetId: new Types.ObjectId(data.targetId),
      reason: data.reason,
    });
    return report.save();
  }

  async findById(id: string): Promise<ReportDocument | null> {
    return this.reportModel.findById(id).lean();
  }

  async findForAdmin({
    page,
    limit,
    targetType,
    status,
  }: {
    page: number;
    limit: number;
    targetType?: ReportTargetType;
    status?: ReportStatus;
  }): Promise<{ data: ReportDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (targetType) {
      filter.targetType = targetType;
    }

    if (status) {
      filter.status = status;
    }

    const [data, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.reportModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async updateStatus(
    reportId: string,
    status: ReportStatus,
    reviewedBy: string,
    adminNote?: string,
  ): Promise<ReportDocument | null> {
    return this.reportModel.findByIdAndUpdate(
      reportId,
      {
        status,
        reviewedBy: new Types.ObjectId(reviewedBy),
        reviewedAt: new Date(),
        ...(adminNote && { adminNote }),
      },
      { new: true },
    );
  }

  async checkDuplicateReport(
    reporterId: string,
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<boolean> {
    const existing = await this.reportModel.findOne({
      'reporter._id': new Types.ObjectId(reporterId),
      targetType,
      targetId: new Types.ObjectId(targetId),
      status: ReportStatus.PENDING,
    });
    return !!existing;
  }

  async resolveAllForTarget(
    targetType: ReportTargetType,
    targetId: string,
    reviewedBy: string,
    adminNote?: string,
  ): Promise<number> {
    const result = await this.reportModel.updateMany(
      {
        targetType,
        targetId: new Types.ObjectId(targetId),
        status: ReportStatus.PENDING,
      },
      {
        status: ReportStatus.RESOLVED,
        reviewedBy: new Types.ObjectId(reviewedBy),
        reviewedAt: new Date(),
        ...(adminNote && { adminNote }),
      },
    );
    return result.modifiedCount;
  }
}
