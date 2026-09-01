/**
 * Cliente HTTP estandarizado y tipado para la comunicación del Frontend con el API Proxy del Backend
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl = "/api/backend";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
          error: data?.error || data?.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        data: data as T,
        status: response.status,
      };
    } catch (err: any) {
      if (err.name === "AbortError") {
        return {
          error: "Petición cancelada.",
          status: 499,
        };
      }
      return {
        error: err?.message || "Error de conexión con el servidor.",
        status: 500,
      };
    }
  }

  public get<T>(
    path: string,
    queryParams?: Record<string, string | number | boolean | undefined | null>,
    options?: RequestOptions
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
        urlPath += `${urlPath.includes("?") ? "&" : "?"}${search}`;
      }
    }
    return this.request<T>(urlPath, { ...options, method: "GET" });
  }

  public post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  // --- Domain Namespaces ---

  public clients = {
    getAll: <T = any>(businessId: string, search?: string) =>
      this.get<T>("/clients", { businessId, search }),
    getById: <T = any>(id: string) => this.get<T>(`/clients/${id}`),
    create: <T = any>(data: any) => this.post<T>("/clients", data),
    update: <T = any>(id: string, data: any) => this.put<T>(`/clients/${id}`, data),
    delete: <T = any>(id: string) => this.delete<T>(`/clients/${id}`),
  };

  public team = {
    getAll: <T = any>(businessId: string) => this.get<T>("/users", { businessId }),
    invite: <T = any>(data: any) => this.post<T>("/users", data),
    update: <T = any>(id: string, data: any) => this.put<T>(`/users/${id}`, data),
    delete: <T = any>(id: string) => this.delete<T>(`/users/${id}`),
  };

  public services = {
    getAll: <T = any>(businessId: string) => this.get<T>("/services", { businessId }),
    create: <T = any>(data: any) => this.post<T>("/services", data),
    update: <T = any>(id: string, data: any) => this.put<T>(`/services/${id}`, data),
    delete: <T = any>(id: string) => this.delete<T>(`/services/${id}`),
  };

  public business = {
    getById: <T = any>(id: string) => this.get<T>(`/business/${id}`),
    update: <T = any>(id: string, data: any) => this.put<T>(`/business/${id}`, data),
    getHours: <T = any>(id: string) => this.get<T>(`/business/${id}/hours`),
    updateHours: <T = any>(id: string, hours: any) => this.put<T>(`/business/${id}/hours`, hours),
  };

  public whatsapp = {
    getStatus: <T = any>(businessId: string) => this.get<T>("/whatsapp/status", { businessId }),
    init: <T = any>(businessId: string) => this.post<T>("/whatsapp/init", { businessId }),
    disconnect: <T = any>(businessId: string) => this.post<T>("/whatsapp/disconnect", { businessId }),
    getTemplates: <T = any>(businessId: string) => this.get<T>("/whatsapp/templates", { businessId }),
    saveTemplates: <T = any>(data: any) => this.post<T>("/whatsapp/templates", data),
  };

  public appointments = {
    getAll: <T = any>(businessId: string, startDate?: string, endDate?: string) =>
      this.get<T>("/appointments", { businessId, startDate, endDate }),
    create: <T = any>(data: any) => this.post<T>("/appointments", data),
    update: <T = any>(id: string, data: any) => this.put<T>(`/appointments/${id}`, data),
    delete: <T = any>(id: string) => this.delete<T>(`/appointments/${id}`),
  };

  public auth = {
    verifyOtp: <T = any>(data: { email: string; code: string }) =>
      this.post<T>("/auth-security/verify-otp", data),
    resendOtp: <T = any>(data: { email: string }) =>
      this.post<T>("/auth-security/resend-otp", data),
    forgotPassword: <T = any>(data: { email: string }) =>
      this.post<T>("/auth-security/forgot-password", data),
    resetPassword: <T = any>(data: { email: string; token: string; newPassword: string }) =>
      this.post<T>("/auth-security/reset-password", data),
    setupTwoFactor: <T = { secret: string; qrCode: string; otpAuthUrl: string }>() =>
      this.post<T>("/auth-security/2fa/setup"),
    enableTwoFactor: <T = { message: string; backupCodes: string[] }>(data: {
      secret: string;
      code: string;
    }) => this.post<T>("/auth-security/2fa/enable", data),
    disableTwoFactor: <T = any>(data: { password: string }) =>
      this.post<T>("/auth-security/2fa/disable", data),
    changePassword: <T = any>(data: { currentPassword: string; newPassword: string }) =>
      this.post<T>("/auth-security/change-password", data),
  };
}

export const apiClient = new ApiClient();
