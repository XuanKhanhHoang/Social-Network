export type PostStatus = 'active' | 'deleted' | 'archived';

export interface PostAuthor {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface AdminPostDto {
  _id: string;
  author: PostAuthor;
  content: Record<string, unknown>;
  media?: { url: string; mediaType: string; caption?: string }[];
  plain_text: string;
  visibility: string;
  status: PostStatus;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  deletedAt?: string;
  pendingReportsCount: number;
}

export interface GetAdminPostsParams {
  page?: number;
  limit?: number;
  searchId?: string;
  includeDeleted?: boolean;
}

export interface GetAdminPostsResponse {
  data: AdminPostDto[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export interface DeletePostResponse {
  success: boolean;
  message: string;
  totalReportsResolved: number;
}

export interface RestorePostResponse {
  success: boolean;
  message: string;
}
