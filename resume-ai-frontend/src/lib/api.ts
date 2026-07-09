const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    request<{ token: string; user: any }>("/api/auth/register", { method: "POST", body: data }),
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: any }>("/api/auth/login", { method: "POST", body: data }),
  me: () => request<{ user: any }>("/api/auth/me"),
};

export const jobsApi = {
  list: () => request<any[]>("/api/jobs"),
  get: (id: string) => request<any>(`/api/jobs/${id}`),
  create: (data: any) => request<any>("/api/jobs", { method: "POST", body: data }),
  update: (id: string, data: any) => request<any>(`/api/jobs/${id}`, { method: "PATCH", body: data }),
};

export const candidatesApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>(`/api/candidates${query}`);
  },
  get: (id: string) => request<any>(`/api/candidates/${id}`),
  updateStatus: (id: string, status: string) =>
    request<any>(`/api/candidates/${id}/status`, { method: "PATCH", body: { status } }),
  addNote: (id: string, content: string) =>
    request<any>(`/api/candidates/${id}/notes`, { method: "POST", body: { content } }),
};

export const uploadApi = {
  upload: (formData: FormData) => {
    const token = localStorage.getItem("token");
    return fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((r) => r.json());
  },
  bulkUpload: (formData: FormData) => {
    const token = localStorage.getItem("token");
    return fetch(`${API_BASE}/api/upload/bulk`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((r) => r.json());
  },
};

export const insightsApi = {
  get: (jobId: string) => request<any>(`/api/insights/${jobId}/insights`),
  compare: (candidateIds: string[]) =>
    request<any>("/api/insights/compare", { method: "POST", body: { candidateIds } }),
};

export const publicApi = {
  getJob: (slug: string) => request<any>(`/api/public/jobs/${slug}`),
  listJobs: () => request<any[]>("/api/public/jobs"),
  apply: (slug: string, formData: FormData) =>
    fetch(`${API_BASE}/api/public/jobs/${slug}/apply`, { method: "POST", body: formData }).then((r) => r.json()),
};

export const emailApi = {
  send: (data: { subject: string; body: string; recipient: string; candidateId?: string; jobId?: string; scheduledAt?: string }) =>
    request<any>("/api/emails/send", { method: "POST", body: data }),
  bulkSend: (data: { candidateIds: string[]; subject: string; body: string; scheduledAt?: string }) =>
    request<any>("/api/emails/bulk", { method: "POST", body: data }),
  history: (params?: { candidateId?: string; jobId?: string }) => {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return request<any[]>(`/api/emails/history${query}`);
  },
  analytics: () => request<any>("/api/emails/analytics"),
  getTemplates: () => request<any[]>("/api/emails/templates"),
  createTemplate: (data: { name: string; subject: string; body: string; category: string }) =>
    request<any>("/api/emails/templates", { method: "POST", body: data }),
  updateTemplate: (id: string, data: any) =>
    request<any>(`/api/emails/templates/${id}`, { method: "PUT", body: data }),
  deleteTemplate: (id: string) =>
    request<any>(`/api/emails/templates/${id}`, { method: "DELETE" }),
  seedTemplates: () => request<any[]>("/api/emails/templates/seed"),
};

export const notificationApi = {
  list: () => request<any[]>("/api/notifications"),
  unreadCount: () => request<{ count: number }>("/api/notifications/unread-count"),
  markRead: (id: string) => request<any>(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request<any>("/api/notifications/read-all", { method: "PATCH" }),
};
