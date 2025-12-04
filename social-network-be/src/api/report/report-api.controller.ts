import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  SubmitReportService,
  SubmitReportOutput,
} from 'src/use-case/report/submit-report/submit-report.service';
import { SubmitReportDto } from './dto/submit-report.dto';
import { JwtAuthGuard } from 'src/others/guards/jwt-auth.guard';
import { GetUserId } from 'src/share/decorators/user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
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
