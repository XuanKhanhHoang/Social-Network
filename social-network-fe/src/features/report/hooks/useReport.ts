import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reportService } from '../services/report.service';
import { SubmitReportDto } from '../types/report.dto';

export const useSubmitReport = () => {
  return useMutation({
    mutationFn: (data: SubmitReportDto) => reportService.submitReport(data),
    onSuccess: () => {
      toast.success('Báo cáo đã được gửi thành công');
    },
    onError: (error: unknown) => {
      const status = (error as { status?: number })?.status;
      if (status === 409) {
        toast.error('Bạn đã báo cáo nội dung này rồi');
      } else {
        toast.error('Có lỗi xảy ra khi gửi báo cáo');
      }
    },
  });
};
