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

export function mapPostMediaDtoToPostMedia(
  postMediaDto: PostMediaDto
): PostMedia {
  return {
    mediaId: postMediaDto.mediaId,
    mediaType: postMediaDto.mediaType,
    url: postMediaDto.url,
    caption: postMediaDto.caption ?? '',
    order: postMediaDto.order ?? 0,
    width: postMediaDto.width,
    height: postMediaDto.height,
  };
}

export function transformToPost(post: PostDto): Post {
  return {
    id: post._id,
    author: transformToUserSummaryWidthAvatarUrl(post.author),
    content: post.content ?? '',
    backgroundValue: post.backgroundValue,
    sharesCount: post.sharesCount ?? 0,
    tags: post.tags ?? [],
    hashtags: post.hashtags ?? [],
    location: post.location,
    status: post.status,
    reactionsBreakdown: post.reactionsBreakdown ?? {},
    hotScore: post.hotScore ?? 0,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    media: Array.isArray(post.media)
      ? post.media.map(mapPostMediaDtoToPostMedia)
      : [],
    visibility: post.visibility,
    reactionsCount: post.reactionsCount ?? 0,
    commentsCount: post.commentsCount ?? 0,
    parentPost: post.parentPost ? transformToPost(post.parentPost) : undefined,
  };
}

export function transformToPostWithMyReaction(
  post: PostWithMyReactionDto
): PostWithMyReaction {
  const basePost = transformToPost(post);

  return {
    ...basePost,
    myReaction: (post.myReaction as ReactionType) || null,
  };
}

export function transformToPostWithTopComment(
  post: PostWithTopCommentDto
): PostWithTopComment {
  const postWithReaction = transformToPostWithMyReaction(post);

  return {
    ...postWithReaction,
    topComment: post.topComment
      ? transformToCommentWithMyReaction(post.topComment)
      : null,
  };
}
