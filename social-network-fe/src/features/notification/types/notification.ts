import { NotificationType } from '../const';

export interface Notification {
  id: string;
  sender: {
    id: string;
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
  metadata?: any;
}
