import { ApiClient } from '@/services/api';
import {
  GetReportsParams,
  GetReportsResponse,
  UpdateReportStatusDto,
  UpdateReportStatusResponse,
  ReportTargetDto,
} from './report.dto';

const ADMIN_REPORTS_PREFIX = '/admin/reports';

export const adminReportService = {
  async getReports(params?: GetReportsParams): Promise<GetReportsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.targetType) queryParams.set('targetType', params.targetType);
    if (params?.status) queryParams.set('status', params.status);

    const query = queryParams.toString();
    return ApiClient.get(
      `${ADMIN_REPORTS_PREFIX}/violations${query ? `?${query}` : ''}`
    );
  },

  async updateReportStatus(
    reportId: string,
    data: UpdateReportStatusDto
  ): Promise<UpdateReportStatusResponse> {
    return ApiClient.patch(
      `${ADMIN_REPORTS_PREFIX}/violations/${reportId}`,
      data
    );
  },

  async getReportTarget(reportId: string): Promise<ReportTargetDto> {
    return ApiClient.get(
      `${ADMIN_REPORTS_PREFIX}/violations/${reportId}/target`
    );
  },
};
