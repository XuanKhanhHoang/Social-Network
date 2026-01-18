import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import {
  SubmitReportService,
  SubmitReportOutput,
} from 'src/use-case/report/submit-report/submit-report.service';
import {
  GetReportByIdService,
  GetReportByIdOutput,
} from 'src/use-case/report/get-report-by-id/get-report-by-id.service';
import {
  GetReportResultService,
  GetReportResultOutput,
} from 'src/use-case/report/get-report-result/get-report-result.service';
import {
  SubmitAppealService,
  SubmitAppealOutput,
} from 'src/use-case/report/submit-appeal/submit-appeal.service';
import { SubmitReportDto } from './dto/submit-report.dto';
import { GetUserId } from 'src/share/decorators/user.decorator';

@Controller('reports')
export class ReportApiController {
  constructor(
    private readonly submitReportService: SubmitReportService,
    private readonly getReportByIdService: GetReportByIdService,
    private readonly getReportResultService: GetReportResultService,
    private readonly submitAppealService: SubmitAppealService,
  ) {}

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

  @Get(':id')
  async getReportById(
    @Param('id') reportId: string,
    @GetUserId() userId: string,
  ): Promise<GetReportByIdOutput> {
    return this.getReportByIdService.execute({ reportId, userId });
  }

  @Get(':id/result')
  async getReportResult(
    @Param('id') reportId: string,
    @GetUserId() userId: string,
  ): Promise<GetReportResultOutput> {
    return this.getReportResultService.execute({ reportId, userId });
  }

  @Post(':id/appeal')
  async submitAppeal(
    @Param('id') reportId: string,
    @Body() dto: { reason: string },
    @GetUserId() userId: string,
  ): Promise<SubmitAppealOutput> {
    return this.submitAppealService.execute({
      reportId,
      userId,
      reason: dto.reason,
    });
  }
}
