import { apiClient } from "./apiClient";

export const usersService = {
  me() {
    return apiClient.get("/users/me");
  },
};
