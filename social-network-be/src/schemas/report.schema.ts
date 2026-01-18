import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubUser } from './sub-user.schema';

export enum ReportTargetType {
  POST = 'post',
  COMMENT = 'comment',
}

export enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  APPEALED = 'appealed',
}

@Schema({ timestamps: true, collection: 'reports' })
export class ReportDocument extends Document {
  @Prop({ type: SubUser, required: true })
  reporter: SubUser;

  @Prop({
    type: String,
    enum: ReportTargetType,
    required: true,
    index: true,
  })
  targetType: ReportTargetType;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  targetId: Types.ObjectId;

  @Prop({ type: String, required: true })
  reason: string;

  @Prop({
    type: String,
    enum: ReportStatus,
    default: ReportStatus.PENDING,
    index: true,
  })
  status: ReportStatus;

  @Prop({ type: String })
  adminNote?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop({ type: Date, index: true })
  notifyReporterAt?: Date;

  @Prop({ type: Boolean, default: false })
  reporterNotified: boolean;

  @Prop({ type: Boolean, default: false })
  hasAppealed: boolean;

  @Prop({ type: String })
  appealReason?: string;

  @Prop({ type: Date })
  appealedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(ReportDocument);
ReportSchema.index({ 'reporter._id': 1 });
ReportSchema.index({ targetType: 1, targetId: 1 });
ReportSchema.index({ status: 1, createdAt: -1 });
