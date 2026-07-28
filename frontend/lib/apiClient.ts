/**
 * Cliente HTTP estandarizado para la comunicación del Frontend con el API Proxy del Backend
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl = "/api/backend";

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        return {
          error: data?.error || `Error ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        data: data as T,
        status: response.status,
      };
    } catch (err: any) {
      console.error(`[API Client Error] ${options.method || "GET"} ${url}:`, err);
      return {
        error: "Error de conexión con el servidor.",
        status: 500,
      };
    }
  }

  public get<T>(
    path: string,
    queryParams?: Record<string, string | number | undefined>
  ): Promise<ApiResponse<T>> {
    let urlPath = path;
    if (queryParams) {
      const filteredParams = Object.entries(queryParams).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ""
      );
      if (filteredParams.length > 0) {
        const search = new URLSearchParams(
          filteredParams.map(([k, v]) => [k, String(v)])
        ).toString();
        urlPath += `?${search}`;
      }
    }
    return this.request<T>(urlPath, { method: "GET" });
  }

  public post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
