import { apiRequest } from "./apiClient";

export type ExpenseInput = {
  title: string;
  amount_original: number;
  expense_date: string; // YYYY-MM-DD
  expense_type?: "personal" | "shared";
  category?: string;
  currency?: string;
  memo?: string;
  receipt_id?: number;
};

// 여행의 지출 목록 조회 (shared + 본인 personal)
export const getExpenses = (tripId: number | string) => {
  return apiRequest(`/api/expenses/${tripId}`);
};

export const createExpense = (
  tripId: number | string,
  expense: ExpenseInput
) => {
  return apiRequest(`/api/expenses/${tripId}`, {
    method: "POST",
    body: JSON.stringify(expense),
  });
};

export const updateExpense = (
  expenseId: number | string,
  expense: Partial<ExpenseInput>
) => {
  return apiRequest(`/api/expenses/${expenseId}`, {
    method: "PATCH",
    body: JSON.stringify(expense),
  });
};

export const deleteExpense = (expenseId: number | string) => {
  return apiRequest(`/api/expenses/${expenseId}`, {
    method: "DELETE",
  });
};

// 단건 지출 N분할 (user_ids 필요)
export const splitExpense = (
  expenseId: number | string,
  userIds: number[]
) => {
  return apiRequest(`/api/expenses/${expenseId}/split`, {
    method: "POST",
    body: JSON.stringify({ user_ids: userIds }),
  });
};
