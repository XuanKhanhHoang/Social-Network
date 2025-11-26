import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRepository } from 'src/domains/user/user.repository';
import {
  UserEvents,
  UserFriendCountChangedEventPayload,
  UserUpdatedEventPayload,
} from 'src/share/events';

@Injectable()
export class CleanupUnverifiedAccountsListenerService {
  private readonly logger = new Logger(
    CleanupUnverifiedAccountsListenerService.name,
  );

  constructor(private readonly userRepository: UserRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Running scheduled job: CleanupUnverifiedAccounts...');
    try {
      const { deletedCount } = await this.execute();

      this.logger.log(
        `Finished scheduled job. Deleted ${deletedCount} accounts.`,
      );
    } catch (error) {
      this.logger.error('Failed to run CleanupUnverifiedAccounts job', error);
    }
  }
  async execute(): Promise<{ deletedCount: number }> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const deleteCriteria = {
      isVerified: false,
      createdAt: { $lt: twentyFourHoursAgo },
    };

    const { deletedCount } =
      await this.userRepository.deleteMany(deleteCriteria);

    if (deletedCount > 0) {
      this.logger.log(
        `Successfully deleted ${deletedCount} unverified accounts.`,
      );
    }

    return { deletedCount };
  }
  @OnEvent(UserEvents.updated)
  async handleUserUpdated(payload: UserUpdatedEventPayload) {
    try {
      await this.userRepository.updateById(payload.userId, {
        $inc: {
          friendCount: payload.newData.friendCountDelta,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to update user friend count for user ${payload.userId}`,
        error,
      );
    }
  }
  @OnEvent(UserEvents.friendCountChanged)
  async handleFriendCountChanged(payload: UserFriendCountChangedEventPayload) {
    try {
      await this.userRepository.updateById(payload.userId, {
        $inc: {
          friendCount: payload.newData.friendCountDelta,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to update user friend count for user ${payload.userId}`,
        error,
      );
    }
  }
}
