import { apiClient } from "./apiClient";

export const authService = {
  login(payload) {
    return apiClient.post("/auth/login", payload, { skipAuthRefresh: true });
  },
  logout() {
    return apiClient.post("/auth/logout", null, { skipAuthRefresh: true });
  },
  refresh() {
    return apiClient.post("/auth/refresh", null, { skipAuthRefresh: true, skipAuth: true });
  },
};
