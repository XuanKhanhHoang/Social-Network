import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export enum ReportMode {
  DAY = '1d',
  WEEK = '1w',
  MONTH = '1m',
  THREE_MONTHS = '3m',
  SIX_MONTHS = '6m',
  YEAR = '1y',
}

export type GetRegistrationStatsInput = {
  startDate: Date;
  endDate: Date;
  mode: ReportMode;
};

export type RegistrationStatItem = {
  period: string;
  count: number;
};

export type GetRegistrationStatsOutput = {
  data: RegistrationStatItem[];
  total: number;
  startDate: Date;
  endDate: Date;
  mode: ReportMode;
};

@Injectable()
export class GetRegistrationStatsService extends BaseUseCaseService<
  GetRegistrationStatsInput,
  GetRegistrationStatsOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(
    input: GetRegistrationStatsInput,
  ): Promise<GetRegistrationStatsOutput> {
    const { startDate, endDate, mode } = input;

    const { data, total } = await this.userRepository.getRegistrationStats({
      startDate,
      endDate,
      mode,
    });

    return {
      data,
      total,
      startDate,
      endDate,
      mode,
    };
  }
}
