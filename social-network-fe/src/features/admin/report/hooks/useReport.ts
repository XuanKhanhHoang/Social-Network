import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminReportService } from '../services/report.service';
import {
  GetReportsParams,
  UpdateReportStatusDto,
  ReverseReportDto,
} from '../services/report.dto';

export const useAdminReports = (params?: GetReportsParams) => {
  return useQuery({
    queryKey: ['admin-reports', params],
    queryFn: () => adminReportService.getReports(params),
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      data,
    }: {
      reportId: string;
      data: UpdateReportStatusDto;
    }) => adminReportService.updateReportStatus(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });
};

export const useReportTarget = (reportId: string | null) => {
  return useQuery({
    queryKey: ['admin-report-target', reportId],
    queryFn: () => adminReportService.getReportTarget(reportId!),
    enabled: !!reportId,
  });
};

export const useReverseReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      data,
    }: {
      reportId: string;
      data: ReverseReportDto;
    }) => adminReportService.reverseReport(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });
};

export const useResolveAppeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      accepted,
      adminNote,
    }: {
      reportId: string;
      accepted: boolean;
      adminNote?: string;
    }) => adminReportService.resolveAppeal(reportId, accepted, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });
};
