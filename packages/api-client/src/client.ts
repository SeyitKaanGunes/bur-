import type { ApiResponse } from '@burcum/shared';

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.baseUrl.startsWith('http') ? this.baseUrl : `${typeof window !== 'undefined' ? window.location.origin : ''}${this.baseUrl}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      credentials: 'include',
    });

    const data: T = await response.json();

    if (!response.ok) {
      const errorData = data as { error?: string };
      throw new ApiError(errorData.error || 'Bir hata oluştu', response.status, data);
    }

    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = new ApiClient();
