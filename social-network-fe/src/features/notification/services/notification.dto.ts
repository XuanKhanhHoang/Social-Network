import { CursorPaginationResponse } from '@/lib/dtos/common/pagination';
import { NotificationType } from '../const';

export type NotificationDto = {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
  };
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedModel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
};

export type GetNotificationsResponseDto =
  CursorPaginationResponse<NotificationDto>;
