const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAccessToken = () => localStorage.getItem("accessToken");

export const getMyTrips = async () => {
  const res = await fetch(`${API_BASE_URL}/api/trips/my`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) throw new Error("내 여행 목록 조회 실패");
  return res.json();
};

export const deleteTrip = async (tripId: number | string) => {
  const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) throw new Error("여행 삭제 실패");
  return res.json();
};

export const createTrip = async (tripData: {
  title: string;
  country: string;
  start_date: string;
  end_date: string;
  latitude: number;
  longitude: number;
}) => {
  const res = await fetch(`${API_BASE_URL}/api/trips/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(tripData),
  });

  if (!res.ok) throw new Error("여행 생성 실패");
  return res.json();
};