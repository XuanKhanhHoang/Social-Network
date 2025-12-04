export type ReportTargetType = 'post' | 'comment';

export interface SubmitReportDto {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}

export interface SubmitReportResponse {
  _id: string;
  message: string;
}
