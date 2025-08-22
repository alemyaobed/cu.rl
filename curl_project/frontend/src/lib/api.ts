import { z } from 'zod';

const UserSchema = z.object({
  uuid: z.string(),
  username: z.string(),
  email: z.string().email().nullable(),
  user_type: z.enum(['guest', 'registered']),
});

const TokenSchema = z.object({
  refresh: z.string(),
  access: z.string(),
  user: UserSchema,
});

const API_BASE_URL = 'http://localhost:8000/api/v1';

let isRefreshing = false;
let refreshPromise: Promise<z.infer<typeof TokenSchema> | null> | null = null;

async function refreshToken() {
  const storedToken = getStoredToken();
  if (!storedToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: storedToken.refresh }),
  });

  if (!response.ok) {
    // Refresh token is invalid, clear storage
    localStorage.removeItem('token');
    return null;
  }

  const data = await response.json();
  const newAccessToken = z.object({ access: z.string() }).parse(data);
  const newToken = { ...storedToken, access: newAccessToken.access };
  storeToken(newToken);
  return newToken;
}

export async function getGuestToken() {
  const response = await fetch(`${API_BASE_URL}/auth/guest-token/`);
  if (!response.ok) {
    throw new Error('Failed to get guest token');
  }
  const data = await response.json();
  return TokenSchema.parse(data);
}

export function storeToken(token: z.infer<typeof TokenSchema>) {
  localStorage.setItem('token', JSON.stringify(token));
}

export function getStoredToken(): z.infer<typeof TokenSchema> | null {
  const storedToken = localStorage.getItem('token');
  if (!storedToken) {
    return null;
  }
  try {
    return TokenSchema.parse(JSON.parse(storedToken));
  } catch (error) {
    console.error('Failed to parse token from local storage', error);
    return null;
  }
}

export async function fetchWithoutAuth(url: string, options: RequestInit = {}) {
  return fetch(`${API_BASE_URL}${url}`, options);
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = getStoredToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.append('Authorization', `Bearer ${token.access}`);
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
      headers.set('Authorization', `Bearer ${newToken.access}`);
      options.headers = headers;
      response = await fetch(`${API_BASE_URL}${url}`, options);
    } else {
      // Handle case where refresh fails
      console.error('Token refresh failed');
      // Optionally, redirect to login or show a message
      // For example, you could throw an error to be caught by the caller
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
}
