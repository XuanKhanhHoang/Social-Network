import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from 'src/share/base-class/base-repository.service';
import { NotificationDocument } from 'src/schemas/notification.schema';
import { CreateNotificationData } from './interfaces/create-notification-data';

@Injectable()
export class NotificationRepository extends BaseRepository<NotificationDocument> {
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(
    @InjectModel('Notification')
    protected readonly model: Model<NotificationDocument>,
  ) {
    super(model);
  }

  async createNotification(
    data: CreateNotificationData,
  ): Promise<NotificationDocument> {
    const newNotification = new this.model({
      ...data,
      receiver: new Types.ObjectId(data.receiver),
      relatedId: new Types.ObjectId(data.relatedId),
    });
    return newNotification.save();
  }

  async findForUser(userId: string, limit: number = 20, cursor?: string) {
    const query: any = { receiver: new Types.ObjectId(userId) };

    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const notifications = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('relatedId')
      .exec();

    let nextCursor: string | null = null;
    if (notifications.length > limit) {
      const nextItem = notifications.pop();
      nextCursor = nextItem ? nextItem._id.toString() : null;
    }

    return {
      data: notifications,
      nextCursor,
    };
  }

  async markAsRead(
    notificationId: string,
  ): Promise<NotificationDocument | null> {
    return this.model
      .findByIdAndUpdate(notificationId, { isRead: true }, { new: true })
      .exec();
  }

  async countUnread(userId: string): Promise<number> {
    return this.model
      .countDocuments({
        receiver: new Types.ObjectId(userId),
        isRead: false,
      })
      .exec();
  }
  async markAllAsRead(userId: string): Promise<void> {
    await this.model
      .updateMany(
        { receiver: new Types.ObjectId(userId), isRead: false },
        { isRead: true },
      )
      .exec();
  }
}
