import { apiRequest } from "./apiClient";

export const getMe = () => {
  return apiRequest("/api/users/me");
};
