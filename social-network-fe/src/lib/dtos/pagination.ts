export type CursorPagination = {
  nextCursor: string | null;
  hasMore: boolean;
};
export type CursorPaginationResponse<T> = {
  data: T[];
  pagination: CursorPagination;
};
