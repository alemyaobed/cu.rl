import { z } from "zod";
import { UserSchema } from "@/lib/schemas";
import { API_BASE_URL } from "./constants";
import logger from "./logger";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Helper function to get CSRF token from cookies
function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

// Helper function to add CSRF token to headers
function addCsrfHeader(headers: HeadersInit = {}): HeadersInit {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    return {
      ...headers,
      "X-CSRFToken": csrfToken,
    };
  }
  return headers;
}

async function refreshToken(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    credentials: "include",
    headers: addCsrfHeader({
      "Content-Type": "application/json",
    }),
  });

  if (!response.ok) {
    logger.error("Refresh token is invalid.");
    return false;
  }

  logger.debug("Token refresh successful");
  return true;
}

export async function getGuestToken() {
  const response = await fetch(`${API_BASE_URL}/auth/guest-token/`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to get guest token");
  }
  const data = await response.json();
  logger.info("Guest token obtained.");
  return UserSchema.parse(data.user);
}

export async function getCurrentUser(): Promise<z.infer<typeof UserSchema> | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me/`, {
      credentials: "include",
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return UserSchema.parse(data.user);
  } catch (error) {
    logger.error("Failed to get current user", error);
    return null;
  }
}

export async function fetchWithoutAuth(url: string, options: RequestInit = {}) {
  const headers = options.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method.toUpperCase())
    ? addCsrfHeader(options.headers)
    : options.headers;
  
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: "include",
    headers,
  });
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = options.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method.toUpperCase())
    ? addCsrfHeader(options.headers)
    : options.headers;
  
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers,
  };

  let response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshSuccess = await refreshPromise;

    if (refreshSuccess) {
      response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);
    } else {
      logger.error("Token refresh failed");
      window.dispatchEvent(new Event("auth-error"));
      throw new Error("Session expired. Please log in again.");
    }
  }

  return response;
}

export async function login(credentials: { login: string; password: string }) {
  const response = await fetchWithAuth("/auth/login/", {
    method: "POST",
    headers: addCsrfHeader({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      username: credentials.login,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.non_field_errors[0] || "Login failed");
  }

  const data = await response.json();
  logger.info(`Login successful for user: ${data.user.username}`);
  return UserSchema.parse(data.user);
}

export async function register(userData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetchWithoutAuth("/auth/registration/", {
    method: "POST",
    headers: addCsrfHeader({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      password1: userData.password,
      password2: userData.confirmPassword,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    logger.error(`Registration error: ${JSON.stringify(errorData)}`);

    const errorMessage =
      (errorData.non_field_errors && errorData.non_field_errors[0]) ||
      (errorData.username && errorData.username[0]) ||
      (errorData.email && errorData.email[0]) ||
      (errorData.password1 && errorData.password1[0]) ||
      (errorData.password2 && errorData.password2[0]) ||
      "Registration failed";

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function logout() {
  // Use fetchWithoutAuth to avoid token refresh logic during logout
  // If already logged out (401), that's fine - we wanted to logout anyway
  const response = await fetchWithoutAuth("/auth/logout/", {
    method: "POST",
    headers: addCsrfHeader({
      "Content-Type": "application/json",
    }),
  });

  // Don't throw on 401 - user is already logged out
  if (!response.ok && response.status !== 401) {
    logger.error("Logout request failed with status:", response.status);
  }
}

export async function forgotPassword(email: string) {
  const response = await fetchWithoutAuth("/auth/password/reset/", {
    method: "POST",
    headers: addCsrfHeader({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.email[0] || "Failed to send password reset email"
    );
  }

  return response.json();
}

export async function resetPasswordConfirm(passwordData: {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}) {
  const response = await fetchWithoutAuth("/auth/password/reset/confirm/", {
    method: "POST",
    headers: addCsrfHeader({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.new_password2[0] || "Failed to reset password");
  }

  return response.json();
}

export async function deleteAccount() {
  const response = await fetchWithAuth("/auth/delete-account/", {
    method: "DELETE",
    headers: addCsrfHeader({
      "Content-Type": "application/json",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete account");
  }

  return response.json();
}
