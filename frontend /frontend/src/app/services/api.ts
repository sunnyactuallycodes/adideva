/**
 * API Client Service for BookMyIndia Backend
 */

/**
 * Normalizes backend API URL to guarantee correct route resolution on local and production Vercel environments.
 */
export function resolveApiBaseUrl(): string {
  let envUrl = "";
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
      envUrl = String(import.meta.env.VITE_API_URL).trim();
    }
  } catch {}

  // If envUrl is empty, points to broken deployment, or is missing, use live production backend
  if (!envUrl || envUrl.includes("adideva-package.vercel.app")) {
    envUrl = "https://adideva.vercel.app/api/v1";
  }

  // Remove trailing slashes
  let cleanUrl = envUrl.replace(/\/+$/, "");

  // Prepend protocol if missing
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // Automatically append /api/v1 if not present
  if (!cleanUrl.endsWith("/api/v1")) {
    if (cleanUrl.endsWith("/api")) {
      cleanUrl = `${cleanUrl}/v1`;
    } else {
      cleanUrl = `${cleanUrl}/api/v1`;
    }
  }

  return cleanUrl;
}

export const API_BASE_URL = resolveApiBaseUrl();

const TOKEN_KEY = "bmi_access_token";
const USER_KEY = "bmi_user";

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
};

export const getStoredUser = (): any | null => {
  try {
    const s = localStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {}
};

/**
 * Core fetch wrapper with Authorization header injection and error normalization
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string; error?: string }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || `Request failed with status ${response.status}`;
      return {
        success: false,
        data: null as any,
        error: errorMsg,
        message: errorMsg,
      };
    }

    return {
      success: true,
      data: data?.data ?? data,
      message: data?.message,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null as any,
      error: err.message || "Network connection error",
      message: err.message || "Network connection error",
    };
  }
}

// ─── API Endpoints ─────────────────────────────────────────────────────────────

export const api = {
  // Auth
  auth: {
    register: (userData: { name: string; email: string; password: string; phone?: string; city?: string }) =>
      request<{ user: any; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    login: (credentials: { email: string; password: string }) =>
      request<{ user: any; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    logout: () =>
      request("/auth/logout", {
        method: "POST",
      }),

    getCurrentUser: () => request<{ user: any }>("/auth/me", { method: "GET" }),
  },

  // Packages
  packages: {
    getAll: (params?: { category?: string; search?: string; activeOnly?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.category && params.category !== "All") q.append("category", params.category);
      if (params?.search) q.append("search", params.search);
      if (params?.activeOnly) q.append("activeOnly", "true");
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<{ packages: any[]; fromCache?: boolean }>(`/packages${qs}`, { method: "GET" });
    },

    getById: (id: string | number) =>
      request<{ package: any; fromCache?: boolean }>(`/packages/${id}`, { method: "GET" }),

    create: (packageData: any) => {
      let body: any;
      if (packageData instanceof FormData) {
        body = packageData;
      } else {
        body = JSON.stringify(packageData);
      }
      return request<{ package: any }>("/packages", {
        method: "POST",
        body,
      });
    },

    update: (id: string | number, packageData: any) => {
      let body: any;
      if (packageData instanceof FormData) {
        body = packageData;
      } else {
        body = JSON.stringify(packageData);
      }
      return request<{ package: any }>(`/packages/${id}`, {
        method: "PUT",
        body,
      });
    },

    toggleActive: (id: string | number) =>
      request<{ package: any }>(`/packages/${id}/toggle-active`, { method: "PATCH" }),

    delete: (id: string | number) =>
      request(`/packages/${id}`, { method: "DELETE" }),
  },

  // Orders & Payments
  orders: {
    calculatePrice: (data: {
      packageId: number | string;
      rooms?: any;
      guests?: number;
      promoCode?: string;
    }) =>
      request<{
        packageId: number;
        packageTitle: string;
        financials: any;
        pricePerPerson: number;
        subtotal: number;
        grossSubtotal: number;
        discountAmount: number;
        discountPercent: number;
        taxes: number;
        total: number;
        amountInPaise: number;
        rooms: any;
        guests: number;
      }>("/orders/calculate-price", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    createRazorpayOrder: (orderData: {
      packageId: number | string;
      guests: number;
      rooms?: any;
      discount?: number;
      travelDate?: string;
      promoCode?: string;
    }) =>
      request<{
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        amountInPaise: number;
        currency: string;
        financials: any;
        keyId: string;
      }>("/orders/razorpay-order", {
        method: "POST",
        body: JSON.stringify(orderData),
      }),

    verifyPayment: (paymentData: {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      orderId?: string;
      packageId: number | string;
      travelDate: string;
      guests: number;
      rooms?: any;
      traveller: { name: string; email: string; phone: string; city?: string };
      paymentMethod: string;
      discount?: number;
      promoCode?: string;
    }) =>
      request<{ order: any }>("/orders/verify", {
        method: "POST",
        body: JSON.stringify(paymentData),
      }),

    getMyOrders: (email?: string) => {
      const q = email ? `?email=${encodeURIComponent(email)}` : "";
      return request<{ orders: any[] }>(`/orders/my-orders${q}`, { method: "GET" });
    },

    getOrderById: (id: string) =>
      request<{ order: any }>(`/orders/${id}`, { method: "GET" }),

    getAllOrders: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append("search", params.search);
      if (params?.status && params.status !== "all") q.append("status", params.status);
      if (params?.page) q.append("page", String(params.page));
      if (params?.limit) q.append("limit", String(params.limit));
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<{ orders: any[]; total: number }>("/orders" + qs, { method: "GET" });
    },

    updateStatus: (id: string, status: string) =>
      request<{ order: any }>(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },

  // Users & Admin
  users: {
    getProfile: () => request<{ user: any }>("/users/profile", { method: "GET" }),

    updateProfile: (data: { name?: string; phone?: string; city?: string; avatar?: string }) =>
      request<{ user: any }>("/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    getAllUsers: (params?: { search?: string; status?: string; page?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append("search", params.search);
      if (params?.status) q.append("status", params.status);
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<{ users: any[]; total: number }>(`/users${qs}`, { method: "GET" });
    },

    updateStatus: (id: string, status: "active" | "inactive") =>
      request<{ user: any }>(`/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    getAdminStats: () =>
      request<{
        totalRevenue: number;
        confirmedOrders: number;
        totalOrders: number;
        totalGuests: number;
        totalPackages: number;
        activePackages: number;
        totalUsers: number;
        activeUsers: number;
      }>("/users/admin/stats", { method: "GET" }),
  },
};
