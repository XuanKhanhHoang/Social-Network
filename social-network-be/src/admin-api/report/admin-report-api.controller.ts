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
  GetRegistrationStatsService,
  GetRegistrationStatsOutput,
} from 'src/admin-use-case/report/get-registration-stats/get-registration-stats.service';
import { GetReportsDto } from './dto/get-reports.dto';
import {
  UpdateReportStatusDto,
  UpdateReportStatusParams,
} from './dto/update-report-status.dto';
import { GetRegistrationStatsDto } from './dto/get-registration-stats.dto';
import { RolesGuard } from 'src/others/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { UserRole } from 'src/share/enums/user-role.enum';
import { GetUserId } from 'src/share/decorators/user.decorator';

@Controller('admin/reports')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminReportApiController {
  constructor(
    private readonly getRegistrationStatsService: GetRegistrationStatsService,
    private readonly getReportsService: GetReportsService,
    private readonly updateReportStatusService: UpdateReportStatusService,
  ) {}

  @Get('registrations')
  async getRegistrationStats(
    @Query() query: GetRegistrationStatsDto,
  ): Promise<GetRegistrationStatsOutput> {
    return this.getRegistrationStatsService.execute(query);
  }

  @Get('violations')
  async getReports(@Query() query: GetReportsDto): Promise<GetReportsOutput> {
    return this.getReportsService.execute(query);
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
