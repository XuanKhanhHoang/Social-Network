import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FriendEvents,
  FriendRequestAcceptedEventPayload,
  FriendRequestSentEventPayload,
  PostCommentedEventPayload,
  PostEvents,
  PostLikedEventPayload,
  CommentEvents,
  CommentLikedEventPayload,
  CommentReplyCreatedEventPayload,
} from 'src/share/events';
import { CreateNotificationService } from '../create-notification/create-notification.service';
import { NotificationType } from 'src/share/enums';

@Injectable()
export class NotificationEventListener {
  private readonly logger = new Logger(NotificationEventListener.name);

  constructor(
    private readonly createNotificationService: CreateNotificationService,
  ) {}

  @OnEvent(FriendEvents.requestSent)
  async handleFriendRequestSent(payload: FriendRequestSentEventPayload) {
    this.logger.log(`Handling Friend Request Sent: ${JSON.stringify(payload)}`);
    await this.createNotificationService.execute({
      sender: { _id: payload.senderId },
      receiver: payload.receiverId,
      type: NotificationType.FRIEND_REQUEST_SENT,
      relatedId: payload.requestId,
      relatedModel: 'Friendship',
    });
  }

  @OnEvent(FriendEvents.requestAccepted)
  async handleFriendRequestAccepted(
    payload: FriendRequestAcceptedEventPayload,
  ) {
    this.logger.log(
      `Handling Friend Request Accepted: ${JSON.stringify(payload)}`,
    );
    await this.createNotificationService.execute({
      sender: { _id: payload.userId },
      receiver: payload.friendId,
      type: NotificationType.FRIEND_REQUEST_ACCEPTED,
      relatedId: payload.friendshipId,
      relatedModel: 'Friendship',
    });
  }

  @OnEvent(PostEvents.liked)
  async handlePostLiked(payload: PostLikedEventPayload) {
    this.logger.log(`Handling Post Liked: ${JSON.stringify(payload)}`);
    await this.createNotificationService.execute({
      sender: { _id: payload.userId },
      receiver: payload.ownerId,
      type: NotificationType.POST_LIKED,
      relatedId: payload.postId,
      relatedModel: 'Post',
    });
  }

  @OnEvent(PostEvents.commented)
  async handlePostCommented(payload: PostCommentedEventPayload) {
    this.logger.log(`Handling Post Commented: ${JSON.stringify(payload)}`);
    await this.createNotificationService.execute({
      sender: { _id: payload.userId },
      receiver: payload.ownerId,
      type: NotificationType.POST_COMMENTED,
      relatedId: payload.postId,
      relatedModel: 'Post',
    });
  }

  @OnEvent(CommentEvents.liked)
  async handleCommentLiked(payload: CommentLikedEventPayload) {
    this.logger.log(`Handling Comment Liked: ${JSON.stringify(payload)}`);
    await this.createNotificationService.execute({
      sender: { _id: payload.userId },
      receiver: payload.ownerId,
      type: NotificationType.COMMENT_LIKED,
      relatedId: payload.commentId,
      relatedModel: 'Comment',
    });
  }

  @OnEvent(CommentEvents.replyCreated)
  async handleCommentReplyCreated(payload: CommentReplyCreatedEventPayload) {
    this.logger.log(
      `Handling Comment Reply Created: ${JSON.stringify(payload)}`,
    );
    await this.createNotificationService.execute({
      sender: { _id: payload.userId },
      receiver: payload.ownerId,
      type: NotificationType.COMMENT_REPLY_CREATED,
      relatedId: payload.commentId,
      relatedModel: 'Comment',
    });
  }
}
