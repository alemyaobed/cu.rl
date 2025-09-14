export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || process.env.VITE_BACKEND_URL;
export const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1`;
export const API_ADMIN_URL = `${BACKEND_BASE_URL}/admin`;
