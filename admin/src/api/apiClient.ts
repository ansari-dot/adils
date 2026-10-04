const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getStoredToken(): string | null {
  return localStorage.getItem('bakery_admin_token');
}

function normalizeResponse(responseData: any, responseStatus: number): any {
  if (responseData === null || responseData === undefined) {
    return { success: responseStatus >= 200 && responseStatus < 300 };
  }

  if (typeof responseData !== 'object') {
    return responseData;
  }

  const success =
    responseData.success !== undefined
      ? Boolean(responseData.success)
      : responseStatus >= 200 && responseStatus < 300;
  const message = responseData.message || '';
  const statusCode = responseData.statusCode || responseStatus;

  let normalized: any = {
    ...responseData,
    success,
    message,
    statusCode,
  };

  if (responseData.data !== undefined) {
    const data = responseData.data;
    normalized.data = data;

    if (Array.isArray(data)) {
      normalized.count = normalized.count ?? data.length;
      normalized.items = normalized.items ?? data;
      normalized.products = normalized.products ?? data;
      normalized.users = normalized.users ?? data;
      normalized.orders = normalized.orders ?? data;
      normalized.courses = normalized.courses ?? data;
      normalized.enrollments = normalized.enrollments ?? data;
      normalized.requests = normalized.requests ?? data;
      normalized.media = normalized.media ?? data;
      normalized.notifications = normalized.notifications ?? data;
      normalized.logs = normalized.logs ?? data;
      normalized.revenue = normalized.revenue ?? data;
      normalized.popular = normalized.popular ?? data;
      normalized.popularProducts = normalized.popularProducts ?? data;
      normalized.results = normalized.results ?? data;
    } else if (data && typeof data === 'object') {
      normalized = {
        ...data,
        ...normalized,
      };

      if (Array.isArray(data.items)) {
        normalized.items = data.items;
        normalized.products = normalized.products ?? data.items;
        normalized.users = normalized.users ?? data.items;
        normalized.orders = normalized.orders ?? data.items;
        normalized.courses = normalized.courses ?? data.items;
        normalized.enrollments = normalized.enrollments ?? data.items;
        normalized.requests = normalized.requests ?? data.items;
        normalized.media = normalized.media ?? data.items;
        normalized.logs = normalized.logs ?? data.items;
        normalized.count = normalized.count ?? data.totalItems ?? data.items.length;
        if (data.totalItems !== undefined) {
          normalized.pagination = normalized.pagination ?? {
            total: data.totalItems,
            page: data.currentPage || 1,
            limit: data.limit || 10,
            totalPages: data.totalPages || 1,
          };
        }
      }

      normalized.user = normalized.user ?? (data.user || (data.email ? data : undefined));
      normalized.token = normalized.token ?? data.token;
      normalized.stats = normalized.stats ?? (data.stats || (data.totalUsers !== undefined ? data : undefined));
      normalized.product = normalized.product ?? (data.product || (data.price !== undefined ? data : undefined));
      normalized.order = normalized.order ?? (data.order || (data.grandTotal !== undefined ? data : undefined));
      normalized.course = normalized.course ?? (data.course || (data.level !== undefined ? data : undefined));
      normalized.request = normalized.request ?? (data.request || (data.occasion !== undefined ? data : undefined));
      normalized.config = normalized.config ?? (data.config || (data.basePrices !== undefined ? data : undefined));
    }
  }

  return normalized;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let responseData: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token and broadcast session expiration
      localStorage.removeItem('bakery_admin_token');
      localStorage.removeItem('bakery_admin_user');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    const message =
      (responseData && responseData.message) ||
      (typeof responseData === 'string' && responseData) ||
      `HTTP error ${response.status}: ${response.statusText}`;

    throw new ApiError(message, response.status, responseData);
  }

  return normalizeResponse(responseData, response.status) as T;
}

export const apiClient = {
  get<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let url = endpoint;
    if (queryParams) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return request<T>(url, { method: 'GET' });
  },

  post<T>(endpoint: string, body?: any): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: any): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, {
      method: 'DELETE',
    });
  },
};
