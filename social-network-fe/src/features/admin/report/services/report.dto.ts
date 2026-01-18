import { JSONContent } from '@tiptap/react';

export type ReportTargetType = 'post' | 'comment';
export type ReportStatus = 'pending' | 'resolved' | 'rejected' | 'appealed';

export interface ReportReporter {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface ReportDto {
  _id: string;
  reporter: ReportReporter;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  hasAppealed?: boolean;
  appealReason?: string;
  appealedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetReportsParams {
  page?: number;
  limit?: number;
  targetType?: ReportTargetType;
  status?: ReportStatus;
}

export interface GetReportsResponse {
  data: ReportDto[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export interface UpdateReportStatusDto {
  status: ReportStatus;
  adminNote?: string;
}

export interface UpdateReportStatusResponse {
  _id: string;
  status: ReportStatus;
  message: string;
  targetDeleted?: boolean;
  totalReportsResolved?: number;
}

export interface ReportTargetAuthor {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface ReportTargetMedia {
  url: string;
  mediaType: string;
  caption?: string;
}

export interface ReportTargetDto {
  targetType: ReportTargetType;
  targetId: string;
  content: JSONContent | null;
  author: ReportTargetAuthor;
  createdAt: string;
  media?: ReportTargetMedia[];
  isDeleted: boolean;
}

export interface ReverseReportDto {
  reason: string;
}

export interface ReverseReportResponse {
  success: boolean;
  message: string;
  targetRestored: boolean;
  totalReportsReversed: number;
}
