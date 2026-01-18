import { ApiClient } from '@/services/api';
import { SubmitReportDto, SubmitReportResponse } from '../types/report.dto';

const REPORT_PREFIX = '/reports';

export interface ViolationDetail {
  _id: string;
  targetType: 'post' | 'comment';
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  hasAppealed?: boolean;
  appealReason?: string;
  appealedAt?: string;
  content?: {
    text?: string;
    mediaUrl?: string;
  };
}

export interface ReportResult {
  _id: string;
  targetType: 'post' | 'comment';
  status: string;
  createdAt: string;
  reviewedAt?: string;
}

export const reportService = {
  async submitReport(data: SubmitReportDto): Promise<SubmitReportResponse> {
    return ApiClient.post(`${REPORT_PREFIX}`, data);
  },

  async getViolationDetail(reportId: string): Promise<ViolationDetail> {
    return ApiClient.get(`${REPORT_PREFIX}/${reportId}`);
  },

  async getReportResult(reportId: string): Promise<ReportResult> {
    return ApiClient.get(`${REPORT_PREFIX}/${reportId}/result`);
  },

  async submitAppeal(
    reportId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    return ApiClient.post(`${REPORT_PREFIX}/${reportId}/appeal`, { reason });
  },
};
