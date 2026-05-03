import { apiRequest } from "./apiClient";

export function googleLogin(idToken: string) {
  return apiRequest("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({
      id_token: idToken,
    }),
  });
}