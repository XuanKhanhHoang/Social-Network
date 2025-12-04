import { ApiClient } from '@/services/api';
import { SubmitReportDto, SubmitReportResponse } from '../types/report.dto';

const REPORT_PREFIX = '/reports';

export const reportService = {
  async submitReport(data: SubmitReportDto): Promise<SubmitReportResponse> {
    return ApiClient.post(`${REPORT_PREFIX}`, data);
  },
};
