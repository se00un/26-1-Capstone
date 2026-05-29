import { apiRequest } from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("accessToken");

// 영수증 이미지 업로드 (multipart) → { id, trip_id, image_url, status }
// apiRequest는 JSON 전용이라, FormData는 fetch로 직접 호출 (Content-Type 수동 지정 금지)
export const uploadReceipt = async (tripId: number | string, file: File) => {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/receipts/${tripId}/upload`, {
    method: "POST",
    headers: {
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `영수증 업로드 실패 (${res.status})`);
  }
  return res.json();
};

// OCR 결과 조회 → { status: "completed"|"processing", parsed_json, image_url, ... }
export const getReceiptDetail = (receiptId: number | string) => {
  return apiRequest(`/api/receipts/${receiptId}/detail`);
};

// 파싱 결과를 지출로 확정 (ExpenseCreate 형태)
export const confirmReceipt = (
  receiptId: number | string,
  expense: {
    title: string;
    amount_original: number;
    expense_date: string;
    currency?: string;
    expense_type?: "personal" | "shared";
    category?: string;
    memo?: string;
  }
) => {
  return apiRequest(`/api/receipts/${receiptId}/confirm-receipt`, {
    method: "POST",
    body: JSON.stringify(expense),
  });
};
