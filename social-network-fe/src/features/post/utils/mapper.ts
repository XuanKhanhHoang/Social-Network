import { ReactionType } from '@/lib/constants/enums';
import { transformToUserSummaryWidthAvatarUrl } from '@/features/user/types';
import {
  PostDto,
  PostMediaDto,
  PostWithMyReactionDto,
  PostWithTopCommentDto,
} from '@/features/post/services/post.dto';
import { transformToCommentWithMyReaction } from '@/features/comment/types/comment';
import {
  Post,
  PostMedia,
  PostWithMyReaction,
  PostWithTopComment,
} from '../types/post';

export function transformToPost(post: PostDto): Post {
  return {
    id: post._id,
    author: transformToUserSummaryWidthAvatarUrl(post.author),
    content: post.content,
    backgroundValue: post.backgroundValue,
    sharesCount: post.sharesCount,
    tags: post.tags,
    hashtags: post.hashtags,
    location: post.location,
    status: post.status,
    reactionsBreakdown: post.reactionsBreakdown,
    hotScore: post.hotScore,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    media: post.media,
    visibility: post.visibility,
    reactionsCount: post.reactionsCount,
    commentsCount: post.commentsCount,
  };
}
export function transformToPostWithMyReaction(
  post: PostWithMyReactionDto
): PostWithMyReaction {
  return {
    ...transformToPost(post),
    myReaction: post.myReaction as unknown as ReactionType | null,
  };
}
export function transformToPostWithTopComment(
  post: PostWithTopCommentDto
): PostWithTopComment {
  return {
    ...transformToPostWithMyReaction(post),
    topComment: post.topComment
      ? transformToCommentWithMyReaction(post.topComment)
      : null,
  };
}

export function mapPostMediaDtoToPostMedia(
  postMediaDto: PostMediaDto
): PostMedia {
  return {
    mediaId: postMediaDto.mediaId,
    mediaType: postMediaDto.mediaType,
    url: postMediaDto.url,
    caption: postMediaDto.caption,
    order: postMediaDto.order,
    width: postMediaDto.width,
    height: postMediaDto.height,
  };
}
