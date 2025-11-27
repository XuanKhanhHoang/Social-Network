export enum NotificationType {
  FRIEND_REQUEST_SENT = 'FRIEND_REQUEST_SENT',
  FRIEND_REQUEST_ACCEPTED = 'FRIEND_REQUEST_ACCEPTED',
  POST_LIKED = 'POST_LIKED',
  POST_COMMENTED = 'POST_COMMENTED',
  COMMENT_LIKED = 'COMMENT_LIKED',
  COMMENT_REPLY_CREATED = 'COMMENT_REPLY_CREATED',
}

export interface Notification {
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
}
