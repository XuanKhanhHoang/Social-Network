export interface CursorPaginationResponse<T> {
  data: T[];
  cursor?: string;
  hasNextPage: boolean;
}
