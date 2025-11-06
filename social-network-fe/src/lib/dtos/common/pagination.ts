export interface CursorPagination {
  nextCursor: string | null;
  hasMore: boolean;
}
export interface CursorPaginationResponse<T> {
  data: T[];
  pagination: CursorPagination;
}
