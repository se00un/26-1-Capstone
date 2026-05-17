import { apiRequest } from "./apiClient";

export const getRoutesByTripId = (tripId: number | string) => {
  return apiRequest(`/api/routes/${tripId}`);
};

export const createRoute = (
  tripId: number | string,
  title: string
) => {
  return apiRequest("/api/routes/", {
    method: "POST",
    body: JSON.stringify({
      trip_id: Number(tripId),
      title,
    }),
  });
};

// export const addPlaceToRoute = (routeId: number | string, place: any) => {
//   return apiRequest(`/api/routes/${routeId}/places`, {
//     method: "POST",
//     body: JSON.stringify(place),
//   });
// };
export const addPlaceToRoute = (
  routeId: number | string,
  place: {
    place_name: string;
    address: string;
    latitude: number;
    longitude: number;
    memo: string;
    visit_order: number;
  }
) => {
  return apiRequest(`/api/routes/${routeId}/places`, {
    method: "POST",
    body: JSON.stringify({
      place_name: place.place_name,
      country: "Japan",
      city: "Tokyo",
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      place_type: "tour",
      visit_order: place.visit_order,
      memo: place.memo,
      visited_at: new Date().toISOString(),
    }),
  });
};

export const updateRoutePlaceOrder = (
  routeId: number | string,
  placeIds: number[]
) => {
  return apiRequest(`/api/routes/${routeId}/order`, {
    method: "PATCH",
    body: JSON.stringify({
      orders: placeIds.map((placeId, index) => ({
        place_id: placeId,
        visit_order: index + 1,
      })),
    }),
  });
};

export const deletePlaceFromRoute = (
  routeId: number | string,
  placeId: number | string
) => {
  return apiRequest(`/api/routes/${routeId}/places/${placeId}`, {
    method: "DELETE",
  });
};