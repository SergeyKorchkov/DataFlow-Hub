import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  withCredentials: true,
  timeout: 10000,
});

export function setupApiInterceptors({
  getAccessToken,
  refreshAccessToken,
  onTokenUpdate,
  onUnauthorized,
}) {
  let refreshPromise = null;

  const requestId = apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const responseId = apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config || {};
      const isUnauthorized = error.response?.status === 401;

      if (
        !isUnauthorized ||
        originalRequest._retry ||
        originalRequest.skipAuthRefresh
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const nextAccessToken = await refreshPromise;
        onTokenUpdate(nextAccessToken);

        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${nextAccessToken}`,
        };

        return apiClient(originalRequest);
      } catch (refreshError) {
        onUnauthorized();
        return Promise.reject(refreshError);
      }
    }
  );

  return () => {
    apiClient.interceptors.request.eject(requestId);
    apiClient.interceptors.response.eject(responseId);
  };
}
