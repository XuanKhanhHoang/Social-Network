import { NotificationDto } from '../services/notification.dto';
import { Notification } from '../types';

export const mapNotificationDtoToDomain = (
  dto: NotificationDto
): Notification => {
  return {
    id: dto._id,
    sender: {
      id: dto.sender._id,
      firstName: dto.sender.firstName,
      lastName: dto.sender.lastName,
      username: dto.sender.username,
      avatar: dto.sender.avatar,
    },
    type: dto.type,
    isRead: dto.isRead,
    createdAt: dto.createdAt,
    relatedId: dto.relatedId._id,
    relatedModel: dto.relatedModel,
    metadata: dto.metadata,
  };
};
