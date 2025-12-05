import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domains/user/user.repository';
import { PostRepository } from 'src/domains/post/post.repository';
import { ReportRepository } from 'src/domains/report/report.repository';

export type DashboardStatsOutput = {
  totalUsers: number;
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  usersGrowthPercent: number;
  newPostsThisWeek: number;
  newPostsLastWeek: number;
  postsGrowthPercent: number;
  pendingReports: number;
};

@Injectable()
export class GetDashboardStatsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
    private readonly reportRepository: ReportRepository,
  ) {}

  private calculateGrowthPercent(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  async execute(): Promise<DashboardStatsOutput> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersThisWeek,
      newUsersLastWeek,
      newPostsThisWeek,
      newPostsLastWeek,
      pendingReports,
    ] = await Promise.all([
      this.userRepository.countActiveUsers(),
      this.userRepository.countUsersInPeriod(oneWeekAgo),
      this.userRepository.countUsersInPeriod(twoWeeksAgo, oneWeekAgo),
      this.postRepository.countActivePostsInPeriod(oneWeekAgo),
      this.postRepository.countActivePostsInPeriod(twoWeeksAgo, oneWeekAgo),
      this.reportRepository.countPendingReports(),
    ]);

    return {
      totalUsers,
      newUsersThisWeek,
      newUsersLastWeek,
      usersGrowthPercent: this.calculateGrowthPercent(
        newUsersThisWeek,
        newUsersLastWeek,
      ),
      newPostsThisWeek,
      newPostsLastWeek,
      postsGrowthPercent: this.calculateGrowthPercent(
        newPostsThisWeek,
        newPostsLastWeek,
      ),
      pendingReports,
    };
  }
}
