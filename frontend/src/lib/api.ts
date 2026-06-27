export type SessionUser = {
  username: string;
  full_name: string;
  role: string;
  permissions?: string[];
};

const TOKEN_KEY = "reqflow_token";

export const session = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = session.getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`/api${path}`, { ...options, headers });
  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      message = response.statusText || message;
    }
    if (response.status === 401) session.clear();
    throw new ApiError(message, response.status);
  }
  return response.json() as Promise<T>;
}

export async function downloadDocument(id: number, format: "pdf" | "docx", name: string) {
  const headers = new Headers();
  const token = session.getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`/api/documents/${id}/export?format=${format}`, { headers });
  if (!response.ok) throw new ApiError("Export failed", response.status);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.${format}`;
  anchor.click();
  URL.revokeObjectURL(url);
}
