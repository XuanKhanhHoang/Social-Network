import { GetPostsFeedResponseDto } from '@/lib/dtos';
import { ApiClient } from './api';
import { CursorPaginationParams, RequestOptions } from './type';

const FEED_PREFIX = '/feed';

const getHomeFeed = ({
  queriesOptions,
  options,
}: {
  queriesOptions: CursorPaginationParams;
  options?: RequestOptions;
}): Promise<GetPostsFeedResponseDto> => {
  const queries = new URLSearchParams();
  const { cursor, limit } = queriesOptions;

  if (cursor) queries.set('cursor', cursor);
  if (limit) queries.set('limit', limit.toString());

  const queryString = queries.toString();
  return ApiClient.get(
    `${FEED_PREFIX}${queryString ? `?${queryString}` : ''}`,
    options
  );
};

export const feedService = {
  getHomeFeed,
};
