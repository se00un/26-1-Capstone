import { apiRequest } from "./apiClient";

export type CreateTripRequest = {
  title: string;
  is_group_trip: boolean;
  start_date: string;
  end_date: string;
};

export const getMyTrips = () => {
  return apiRequest("/api/trips/my");
};

export const createTrip = (trip: CreateTripRequest) => {
  return apiRequest("/api/trips/", {
    method: "POST",
    body: JSON.stringify(trip),
  });
};