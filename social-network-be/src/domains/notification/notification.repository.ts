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

  async findForUser(userId: string, limit: number = 20, skip: number = 0) {
    return this.model
      .find({ receiver: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedId')
      .exec();
  }

  async markAsRead(
    notificationId: string,
  ): Promise<NotificationDocument | null> {
    return this.model
      .findByIdAndUpdate(notificationId, { isRead: true }, { new: true })
      .exec();
  }
}
