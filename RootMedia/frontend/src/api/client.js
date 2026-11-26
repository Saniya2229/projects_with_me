import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extracts a human-readable error message from an Axios error response.
 */
export function extractApiError(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (Array.isArray(err?.response?.data?.errors) && err.response.data.errors.length > 0) {
    return err.response.data.errors.map((e) => e.msg || e.message || e).join(', ');
  }
  if (err?.code === 'ERR_NETWORK') {
    return 'Cannot connect to the backend server. Please verify the API URL or start the backend.';
  }
  return err?.message || fallback;
}

export { API_BASE_URL };
export default apiClient;

