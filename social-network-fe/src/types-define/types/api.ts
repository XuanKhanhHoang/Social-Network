export interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}
