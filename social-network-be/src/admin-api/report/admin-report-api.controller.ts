import {
  Controller,
  Get,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  GetReportsService,
  GetReportsOutput,
} from 'src/admin-use-case/report/get-reports/get-reports.service';
import {
  UpdateReportStatusService,
  UpdateReportStatusOutput,
} from 'src/admin-use-case/report/update-report-status/update-report-status.service';
import {
  GetReportTargetService,
  ReportTargetOutput,
} from 'src/admin-use-case/report/get-report-target/get-report-target.service';
import { GetReportsDto } from './dto/get-reports.dto';
import {
  UpdateReportStatusDto,
  UpdateReportStatusParams,
} from './dto/update-report-status.dto';
import { RolesGuard } from 'src/others/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { UserRole } from 'src/share/enums/user-role.enum';
import { GetUserId } from 'src/share/decorators/user.decorator';

@Controller('admin/reports')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminReportApiController {
  constructor(
    private readonly getReportsService: GetReportsService,
    private readonly updateReportStatusService: UpdateReportStatusService,
    private readonly getReportTargetService: GetReportTargetService,
  ) {}

  @Get('violations')
  async getReports(@Query() query: GetReportsDto): Promise<GetReportsOutput> {
    return this.getReportsService.execute(query);
  }

  @Get('violations/:reportId/target')
  async getReportTarget(
    @Param('reportId') reportId: string,
  ): Promise<ReportTargetOutput> {
    return this.getReportTargetService.execute({ reportId });
  }

  @Patch('violations/:reportId')
  async updateReportStatus(
    @Param() params: UpdateReportStatusParams,
    @Body() dto: UpdateReportStatusDto,
    @GetUserId() adminId: string,
  ): Promise<UpdateReportStatusOutput> {
    return this.updateReportStatusService.execute({
      reportId: params.reportId,
      status: dto.status,
      adminId,
      adminNote: dto.adminNote,
    });
  }
}
