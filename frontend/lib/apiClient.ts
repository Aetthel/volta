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

/**
 * Respuesta de la verificación por OTP.
 *
 * `loginToken` sólo viene cuando el código se ha comprobado de verdad y la
 * cuenta acaba de pasar a activa. En el caso `alreadyVerified` no llega, porque
 * esa rama del backend responde sin haber validado ningún código.
 */
export interface VerifyOtpResult {
  message: string;
  alreadyVerified: boolean;
  loginToken?: string | null;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    businessId: string | null;
    status: string;
    emailVerified: boolean;
  };
}

export class ApiError extends Error {
  public status: number;
  public data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
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
    } catch (err) {
      // Un fetch abortado rechaza con DOMException, que hereda de Error, así que
      // `instanceof Error` cubre tanto ese caso como los fallos de red normales.
      if (err instanceof Error && err.name === "AbortError") {
        return {
          error: "Petición cancelada.",
          status: 499,
        };
      }
      return {
        error: (err instanceof Error && err.message) || "Error de conexión con el servidor.",
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
    getAll: <T = unknown>(businessId: string, search?: string) =>
      this.get<T>("/clients", { businessId, search }),
    getById: <T = unknown>(id: string) => this.get<T>(`/clients/${id}`),
    create: <T = unknown>(data: unknown) => this.post<T>("/clients", data),
    update: <T = unknown>(id: string, data: unknown) => this.put<T>(`/clients/${id}`, data),
    delete: <T = unknown>(id: string) => this.delete<T>(`/clients/${id}`),
  };

  public team = {
    getAll: <T = unknown>(businessId: string) => this.get<T>("/users", { businessId }),
    invite: <T = unknown>(data: unknown) => this.post<T>("/users", data),
    update: <T = unknown>(id: string, data: unknown) => this.put<T>(`/users/${id}`, data),
    delete: <T = unknown>(id: string) => this.delete<T>(`/users/${id}`),
  };

  public services = {
    getAll: <T = unknown>(businessId: string) => this.get<T>("/services", { businessId }),
    create: <T = unknown>(data: unknown) => this.post<T>("/services", data),
    update: <T = unknown>(id: string, data: unknown) => this.put<T>(`/services/${id}`, data),
    delete: <T = unknown>(id: string) => this.delete<T>(`/services/${id}`),
  };

  public business = {
    getById: <T = unknown>(id: string) => this.get<T>(`/business/${id}`),
    update: <T = unknown>(id: string, data: unknown) => this.put<T>(`/business/${id}`, data),
    getHours: <T = unknown>(id: string) => this.get<T>(`/business/${id}/hours`),
    updateHours: <T = unknown>(id: string, hours: unknown) => this.put<T>(`/business/${id}/hours`, hours),
    getHolidays: <T = unknown>(id: string) => this.get<T>(`/business/${id}/holidays`),
    updateHolidays: <T = unknown>(id: string, holidays: unknown) =>
      this.put<T>(`/business/${id}/holidays`, holidays),
  };

  public whatsapp = {
    getStatus: <T = unknown>(businessId: string) => this.get<T>("/whatsapp/status", { businessId }),
    init: <T = unknown>(businessId: string) => this.post<T>("/whatsapp/init", { businessId }),
    disconnect: <T = unknown>(businessId: string) => this.post<T>("/whatsapp/disconnect", { businessId }),
    getTemplates: <T = unknown>(businessId: string) => this.get<T>("/whatsapp/templates", { businessId }),
    saveTemplates: <T = unknown>(data: unknown) => this.post<T>("/whatsapp/templates", data),
  };

  public appointments = {
    getAll: <T = unknown>(businessId: string, startDate?: string, endDate?: string) =>
      this.get<T>("/appointments", { businessId, startDate, endDate }),
    create: <T = unknown>(data: unknown) => this.post<T>("/appointments", data),
    update: <T = unknown>(id: string, data: unknown) => this.put<T>(`/appointments/${id}`, data),
    delete: <T = unknown>(id: string) => this.delete<T>(`/appointments/${id}`),
  };

  public auth = {
    verifyOtp: <T = VerifyOtpResult>(data: { email: string; code: string }) =>
      this.post<T>("/auth-security/verify-otp", data),
    resendOtp: <T = unknown>(data: { email: string }) =>
      this.post<T>("/auth-security/resend-otp", data),
    forgotPassword: <T = unknown>(data: { email: string }) =>
      this.post<T>("/auth-security/forgot-password", data),
    resetPassword: <T = unknown>(data: { email: string; token: string; newPassword: string }) =>
      this.post<T>("/auth-security/reset-password", data),
    setupTwoFactor: <T = { secret: string; qrCode: string; otpAuthUrl: string }>() =>
      this.post<T>("/auth-security/2fa/setup"),
    enableTwoFactor: <T = { message: string; backupCodes: string[] }>(data: {
      secret: string;
      code: string;
    }) => this.post<T>("/auth-security/2fa/enable", data),
    disableTwoFactor: <T = unknown>(data: { password: string }) =>
      this.post<T>("/auth-security/2fa/disable", data),
    changePassword: <T = unknown>(data: { currentPassword: string; newPassword: string }) =>
      this.post<T>("/auth-security/change-password", data),
  };
}

export const apiClient = new ApiClient();
