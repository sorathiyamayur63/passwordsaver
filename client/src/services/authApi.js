import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const authClient = axios.create({
  baseURL: '/api/auth',

  withCredentials: true, // CRITICAL: Ensures HttpOnly cookies are sent
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Add unique request ID for tracing
authClient.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = uuidv4();
  return config;
});

// Response Interceptor: Handle transparent token refresh
authClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops on the refresh endpoint itself
    if (originalRequest.url === '/refresh') {
      return Promise.reject(error);
    }

    //if (error.response?.status === 401 && !originalRequest._retry) {
if (
  error.response?.status === 401 &&
  error.response?.data?.code === 'SESSION_REVOKED'
) {
  if (!window.__sessionExpired) {
    window.__sessionExpired = true;
    window.dispatchEvent(
      new Event('auth:unauthorized')
    );
  }

  if (window.location.pathname !== '/login') {
    window.dispatchEvent(
      new Event('auth:unauthorized')
    );
  }

  return Promise.reject(error.response.data);
}


if (error.response?.status === 401 && !originalRequest._retry) {

  // revoked device/session
  if (
    error.response?.data?.code === 'SESSION_REVOKED' ||
    error.response?.data?.message === 'Session revoked'
  ) {
    window.dispatchEvent(new Event('auth:unauthorized'));
    return Promise.reject(error.response.data);
  }

  originalRequest._retry = true;
      
      try {
        await authClient.post('/refresh');
        return authClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g., refresh token expired) -> force re-login
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export const authApi = {
  register: (data) => authClient.post('/register', data),
  login: (data) => authClient.post('/login', data),
  logout: () => authClient.post('/logout'),
  refreshToken: () => authClient.post('/refresh'),
  getMe: () => authClient.get('/me'),
  changePassword: (data) => authClient.put('/change-password', data),
  logoutAllDevices: () => authClient.post('/logout-all')
};