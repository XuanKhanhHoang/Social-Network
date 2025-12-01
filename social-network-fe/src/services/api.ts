import { ApiError, RequestOptions } from './type';

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
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      body = JSON.stringify(body);
    }

    const config: RequestOptions = {
      credentials: 'include',
      ...options,
      headers,
      body,
    };

    let response = await fetch(url, config);

    if (response.status === 401) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          response = await fetch(url, config);
        }
      } catch {
        // Refresh failed, let it fall through to original 401 handling
      }
    }

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
    if (response.status === 204) {
      return null as T;
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
  static async checkSession(options: RequestOptions = {}): Promise<void> {
    await this.post('/auth/check', undefined, {
      credentials: 'include',
      ...options,
    });
  }
}
