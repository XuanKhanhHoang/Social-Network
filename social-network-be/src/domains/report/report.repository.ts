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

  async countPendingReports(): Promise<number> {
    return this.reportModel.countDocuments({ status: ReportStatus.PENDING });
  }

  async findResolvedForTarget(
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<ReportDocument[]> {
    return this.reportModel
      .find({
        targetType,
        targetId: new Types.ObjectId(targetId),
        status: ReportStatus.RESOLVED,
      })
      .lean();
  }

  async rejectResolvedForTarget(
    targetType: ReportTargetType,
    targetId: string,
    reviewedBy: string,
    reversalNote: string,
  ): Promise<number> {
    const resolvedReports = await this.findResolvedForTarget(
      targetType,
      targetId,
    );

    if (resolvedReports.length === 0) {
      return 0;
    }

    const updatePromises = resolvedReports.map((report) => {
      const existingNote = report.adminNote || '';
      const appendedNote = existingNote
        ? `${existingNote}\n----------------\n${reversalNote}`
        : reversalNote;

      return this.reportModel.updateOne(
        { _id: report._id },
        {
          status: ReportStatus.REJECTED,
          reviewedBy: new Types.ObjectId(reviewedBy),
          reviewedAt: new Date(),
          adminNote: appendedNote,
        },
      );
    });

    await Promise.all(updatePromises);
    return resolvedReports.length;
  }

  async countPendingForTargets(
    targetType: ReportTargetType,
    targetIds: string[],
  ): Promise<Map<string, number>> {
    const result = await this.reportModel.aggregate([
      {
        $match: {
          targetType,
          targetId: { $in: targetIds.map((id) => new Types.ObjectId(id)) },
          status: ReportStatus.PENDING,
        },
      },
      {
        $group: {
          _id: '$targetId',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    result.forEach((item: { _id: Types.ObjectId; count: number }) => {
      countMap.set(item._id.toString(), item.count);
    });
    return countMap;
  }

  async setNotifyReporterAt(reportId: string, notifyAt: Date): Promise<void> {
    await this.reportModel.updateOne(
      { _id: new Types.ObjectId(reportId) },
      { notifyReporterAt: notifyAt },
    );
  }

  async findPendingReporterNotifications(): Promise<ReportDocument[]> {
    return this.reportModel
      .find({
        notifyReporterAt: { $lte: new Date() },
        reporterNotified: { $ne: true },
        status: { $in: [ReportStatus.RESOLVED, ReportStatus.REJECTED] },
      })
      .lean();
  }

  async markReporterNotified(reportId: string): Promise<void> {
    await this.reportModel.updateOne(
      { _id: new Types.ObjectId(reportId) },
      { reporterNotified: true },
    );
  }

  async submitAppeal(reportId: string, reason: string): Promise<void> {
    await this.reportModel.updateOne(
      { _id: new Types.ObjectId(reportId) },
      {
        status: ReportStatus.APPEALED,
        hasAppealed: true,
        appealReason: reason,
        appealedAt: new Date(),
      },
    );
  }

  async resolveAppeal(
    reportId: string,
    accepted: boolean,
    reviewedBy: string,
    adminNote?: string,
  ): Promise<void> {
    await this.reportModel.updateOne(
      { _id: new Types.ObjectId(reportId) },
      {
        status: accepted ? ReportStatus.REJECTED : ReportStatus.RESOLVED,
        reviewedBy: new Types.ObjectId(reviewedBy),
        reviewedAt: new Date(),
        ...(adminNote && { adminNote }),
      },
    );
  }

  async findAppealed(): Promise<ReportDocument[]> {
    return this.reportModel
      .find({ status: ReportStatus.APPEALED })
      .sort({ appealedAt: -1 })
      .lean();
  }
}
