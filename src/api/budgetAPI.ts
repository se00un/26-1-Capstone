import { apiRequest } from "./apiClient";

export type BudgetCategoryInput = {
  category: string;
  amount: number;
  currency?: string;
};

// 카테고리별 예산 목록 조회
export const getBudgets = (tripId: number | string) => {
  return apiRequest(`/api/budget/${tripId}`);
};

// 예산 요약 (총예산/총지출/burn_rate/risk_status/category_stats)
export const getBudgetSummary = (tripId: number | string) => {
  return apiRequest(`/api/budget/${tripId}/summary`);
};

// 예산 전체 저장 (기존 예산을 교체)
export const upsertBudgets = (
  tripId: number | string,
  budgets: BudgetCategoryInput[]
) => {
  return apiRequest(`/api/budget/${tripId}`, {
    method: "PUT",
    body: JSON.stringify({
      budgets: budgets.map((b) => ({
        category: b.category,
        amount: b.amount,
        currency: b.currency ?? "KRW",
      })),
    }),
  });
};

export const deleteBudgets = (
  tripId: number | string,
  budgetIds: number[]
) => {
  return apiRequest(`/api/budget/${tripId}`, {
    method: "DELETE",
    body: JSON.stringify({ budget_ids: budgetIds }),
  });
};
