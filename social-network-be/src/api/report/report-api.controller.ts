import { Controller, Post, Body } from '@nestjs/common';
import {
  SubmitReportService,
  SubmitReportOutput,
} from 'src/use-case/report/submit-report/submit-report.service';
import { SubmitReportDto } from './dto/submit-report.dto';
import { GetUserId } from 'src/share/decorators/user.decorator';

@Controller('reports')
export class ReportApiController {
  constructor(private readonly submitReportService: SubmitReportService) {}

  @Post()
  async submitReport(
    @Body() dto: SubmitReportDto,
    @GetUserId() userId: string,
  ): Promise<SubmitReportOutput> {
    return this.submitReportService.execute({
      userId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
    });
  }
}
