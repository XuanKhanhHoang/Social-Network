/* eslint-disable @typescript-eslint/no-explicit-any */
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
  relatedId?: any;
  relatedModel?: string;
  metadata: any;
};

export type GetNotificationsResponseDto =
  CursorPaginationResponse<NotificationDto>;
