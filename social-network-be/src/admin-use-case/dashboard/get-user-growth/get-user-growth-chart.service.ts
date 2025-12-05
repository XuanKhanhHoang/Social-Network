import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domains/user/user.repository';

export type ViewMode = 'day' | 'week' | 'month';

export type UserGrowthChartInput = {
  mode?: ViewMode;
};

export type UserGrowthDataPoint = {
  period: string;
  label: string;
  dateRange: string;
  count: number;
};

export type UserGrowthChartOutput = {
  data: UserGrowthDataPoint[];
  total: number;
};

const MODE_CONFIG: Record<ViewMode, { days: number; dbMode: string }> = {
  day: { days: 30, dbMode: '1d' },
  week: { days: 12 * 7, dbMode: '1w' },
  month: { days: 365, dbMode: '1m' },
};

@Injectable()
export class GetUserGrowthChartService {
  constructor(private readonly userRepository: UserRepository) {}

  private getFirstDayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }

  private formatMonthYear(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private generatePeriods(
    startDate: Date,
    endDate: Date,
    mode: ViewMode,
  ): UserGrowthDataPoint[] {
    const periods: UserGrowthDataPoint[] = [];
    const current = new Date(startDate);
    const now = new Date();

    while (current <= endDate && current <= now) {
      let periodKey: string;
      let label: string;
      let dateRange: string;

      switch (mode) {
        case 'day': {
          periodKey = current.toISOString().slice(0, 10);
          label = this.formatDate(current);
          dateRange = `${this.formatDate(current)}/${current.getFullYear()}`;
          current.setDate(current.getDate() + 1);
          break;
        }
        case 'week': {
          const weekStart = this.getFirstDayOfWeek(current);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const weekNum = this.getWeekNumber(weekStart);
          periodKey = `${weekStart.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
          label = `W${weekNum}`;
          dateRange = `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
          current.setDate(current.getDate() + 7);
          break;
        }
        case 'month': {
          const year = current.getFullYear();
          const month = current.getMonth();
          periodKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;
          label = this.formatMonthYear(current);

          const lastDay = new Date(year, month + 1, 0).getDate();
          dateRange = `01/${(month + 1).toString().padStart(2, '0')} - ${lastDay}/${(month + 1).toString().padStart(2, '0')}/${year}`;
          current.setMonth(current.getMonth() + 1);
          break;
        }
      }

      if (!periods.find((p) => p.period === periodKey)) {
        periods.push({ period: periodKey, label, dateRange, count: 0 });
      }
    }

    return periods;
  }

  async execute(input: UserGrowthChartInput): Promise<UserGrowthChartOutput> {
    const mode = input.mode || 'day';
    const config = MODE_CONFIG[mode];
    const endDate = new Date();
    const startDate = new Date(
      endDate.getTime() - config.days * 24 * 60 * 60 * 1000,
    );

    const result = await this.userRepository.getRegistrationStats({
      startDate,
      endDate,
      mode: config.dbMode,
    });

    const dataMap = new Map(result.data.map((d) => [d.period, d.count]));
    const periods = this.generatePeriods(startDate, endDate, mode);

    const filledData = periods.map((p) => ({
      ...p,
      count: dataMap.get(p.period) || 0,
    }));

    return {
      data: filledData,
      total: result.total,
    };
  }
}
