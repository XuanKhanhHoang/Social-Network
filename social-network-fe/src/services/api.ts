import { ApiError, RequestOptions } from '@/types-define/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export class ApiClient {
  static async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      ...options.headers,
    };

    let body = options.body;

    if (body instanceof FormData) {
      // Do nothing
    } else if (
      body &&
      typeof body === 'object' &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer)
    ) {
      // Nếu body là object → stringify và set JSON
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      body = JSON.stringify(body);
    }

    const config: RequestOptions = {
      credentials: 'include',
      ...options,
      headers,
      body,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error: ApiError = new Error(
        `HTTP error! status: ${response.status}`
      );
      error.status = response.status;

      try {
        error.data = await response.json();
      } catch {
        error.data = {};
      }
      throw error;
    }

    return response.json();
  }

  static get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  static post<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data as BodyInit,
      ...options,
    });
  }
  static delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
  static patch<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data as BodyInit,
      ...options,
    });
  }
}
