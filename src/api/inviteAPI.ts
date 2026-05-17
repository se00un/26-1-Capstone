import { apiRequest } from "./apiClient";

export const createInvite = (tripId: number | string) => {
  return apiRequest(`/api/trips/${tripId}/invites`, {
    method: "POST",
    body: JSON.stringify({
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  });
};

export const acceptInvite = (inviteCode: string) => {
  return apiRequest(`/api/invites/${inviteCode}/accept`, {
    method: "POST",
  });
};