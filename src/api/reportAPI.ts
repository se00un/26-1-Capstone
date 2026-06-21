const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAccessToken = () => localStorage.getItem("accessToken");

export const getTripReport = async (tripId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/reports/${tripId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "리포트 조회 실패");
  }

  return res.json();
};

export const generateTripReport = async (tripId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/reports/${tripId}/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "리포트 생성 실패");
  }

  return res.json();
};