/**
 * API client and authentication store for EduBridge
 */

const API_BASE = import.meta.env.VITE_API_URL || "https://final-backend-dtw1.onrender.com";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  token?: string;
}

export function getToken(): string | null {
  return localStorage.getItem("edubridge_token");
}

export function setToken(token: string) {
  localStorage.setItem("edubridge_token", token);
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem("edubridge_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User) {
  localStorage.setItem("edubridge_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("edubridge_token");
  localStorage.removeItem("edubridge_user");
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    const errorBody = await response.text();
    try {
      const errJson = JSON.parse(errorBody);
      errorMsg = errJson?.message || errJson?.error || errorBody || errorMsg;
    } catch {
      if (errorBody) errorMsg = errorBody;
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
