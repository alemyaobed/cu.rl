import { z } from "zod";
import { TokenSchema } from "@/lib/schemas";
import { API_BASE_URL } from "./constants";
import logger from "./logger";

let isRefreshing = false;
let refreshPromise: Promise<z.infer<typeof TokenSchema> | null> | null = null;

async function refreshToken() {
  const storedToken = getStoredToken();
  if (!storedToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: storedToken.refresh }),
  });

  if (!response.ok) {
    // Refresh token is invalid, clear storage
    localStorage.removeItem("token");
    logger.error("Refresh token is invalid.");
    return null;
  }

  const data = await response.json();
  logger.debug(`Token refresh successful: ${JSON.stringify(data)}`);

  const newToken = {
    ...storedToken,
    access: data.access,
    refresh: data.refresh,
  };

  const newTokenToStore = TokenSchema.parse(newToken);

  storeToken(newTokenToStore);
  return newTokenToStore;
}

export async function getGuestToken() {
  const response = await fetch(`${API_BASE_URL}/auth/guest-token/`);
  if (!response.ok) {
    throw new Error("Failed to get guest token");
  }
  const data = await response.json();
  logger.info("Guest token obtained.");
  return TokenSchema.parse(data);
}

export function storeToken(token: z.infer<typeof TokenSchema>) {
  localStorage.setItem("token", JSON.stringify(token));
}

export function getStoredToken(): z.infer<typeof TokenSchema> | null {
  const storedToken = localStorage.getItem("token");
  if (!storedToken) {
    return null;
  }
  try {
    return TokenSchema.parse(JSON.parse(storedToken));
  } catch (error) {
    logger.error("Failed to parse token from local storage", error);
    return null;
  }
}

export async function fetchWithoutAuth(url: string, options: RequestInit = {}) {
  return fetch(`${API_BASE_URL}${url}`, options);
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.append("Authorization", `Bearer ${token.access}`);
  }

  options.headers = headers;

  let response = await fetch(`${API_BASE_URL}${url}`, options);

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken.access}`);
      options.headers = headers;
      response = await fetch(`${API_BASE_URL}${url}`, options);
    } else {
      // Handle case where refresh fails
      logger.error("Token refresh failed");
      // Dispatch an event to notify the app of auth failure
      window.dispatchEvent(new Event("auth-error"));
      throw new Error("Session expired. Please log in again.");
    }
  }

  return response;
}

export async function login(credentials: { login: string; password: string }) {
  const response = await fetchWithAuth("/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const tokenToStore = TokenSchema.parse(data);

  storeToken(tokenToStore);
  return tokenToStore;
}

export async function register(userData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetchWithoutAuth("/auth/registration/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
   
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function logout() {
  const token = getStoredToken();
  if (!token) {
    return;
  }

  const response = await fetchWithAuth("/auth/logout/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: token.refresh }),
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  localStorage.removeItem("token");
}

export async function forgotPassword(email: string) {
  const response = await fetchWithoutAuth("/auth/password/reset/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.new_password2[0] || "Failed to reset password");
  }

  return response.json();
}