import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reportService,
  ViolationDetail,
  ReportResult,
} from '../services/report.service';

export const useViolationDetail = (reportId: string) => {
  return useQuery<ViolationDetail>({
    queryKey: ['violation', reportId],
    queryFn: () => reportService.getViolationDetail(reportId),
    enabled: !!reportId,
    staleTime: 0,
  });
};

export const useReportResult = (reportId: string) => {
  return useQuery<ReportResult>({
    queryKey: ['reportResult', reportId],
    queryFn: () => reportService.getReportResult(reportId),
    enabled: !!reportId,
  });
};

export const useSubmitAppeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, reason }: { reportId: string; reason: string }) =>
      reportService.submitAppeal(reportId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['violation', variables.reportId],
      });
    },
  });
};
