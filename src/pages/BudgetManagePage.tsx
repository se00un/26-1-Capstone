import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBudgets, upsertBudgets } from "../api/budgetAPI";
import { getExpenses } from "../api/expenseAPI";
import { CATEGORIES, CATEGORY_DANGER_THRESHOLD } from "../constants/categories";
import CurrencySelect from "../components/CurrencySelect";
import { formatMoney, formatNumberInput, digitsOnly } from "../utils/money";
import {
  getKrwRateTable,
  budgetToKrw,
  expenseToKrw,
} from "../utils/currency";
import "./BudgetPage.css";
import "./BudgetManagePage.css";

// "총예산"은 카테고리와 별개로 사용자가 직접 입력하는 전체 예산 행
const TOTAL_KEY = "총예산";
// "기타"는 입력하지 않고 (총예산 - 나머지 카테고리)로 자동 계산
const ETC_KEY = "기타";

type CategoryStat = { budget: number; expense: number };

type Summary = {
  total_budget_krw: number;
  total_expense_krw: number;
  category_stats: Record<string, CategoryStat>;
};

const toNum = (s?: string) => Number(digitsOnly(String(s ?? ""))) || 0;

const getMyId = (): number | null => {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.id ?? null;
  } catch {
    return null;
  }
};

// 예산/지출 통계를 프론트에서 직접 계산 (전부 보정된 KRW 기준).
// 백엔드 /summary는 환율 fallback(1.0)으로 오염된 amount_krw를 그대로 합산해서
// 통화가 섞이면 예산↔지출 스케일이 안 맞는 문제가 있음 → 클라이언트 보정 계산으로 대체
const computeSummary = (
  budgets: any[],
  expenses: any[],
  table: Record<string, number> | null
): Summary => {
  const myId = getMyId();
  // 백엔드 summary와 동일한 범위: shared + 본인 personal
  const filtered = expenses.filter(
    (e) =>
      e.expense_type === "shared" ||
      (e.expense_type === "personal" && e.created_by === myId)
  );

  const stats: Record<string, CategoryStat> = {};
  for (const b of budgets) {
    const cat = b.category;
    const val = budgetToKrw(b, table);
    stats[cat] = stats[cat] ?? { budget: 0, expense: 0 };
    stats[cat].budget += val;
  }
  let totalExpense = 0;
  for (const e of filtered) {
    const cat = e.category || ETC_KEY;
    const val = expenseToKrw(e, table);
    stats[cat] = stats[cat] ?? { budget: 0, expense: 0 };
    stats[cat].expense += val;
    totalExpense += val;
  }

  return {
    total_budget_krw: budgets.reduce((s, b) => s + budgetToKrw(b, table), 0),
    total_expense_krw: totalExpense,
    category_stats: stats,
  };
};

// SVG 도넛 (사용률 링)
function Donut({
  label,
  percent,
  danger,
}: {
  label: string;
  percent: number;
  danger: boolean;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(Math.max(percent, 0), 100) / 100) * c;
  const color = danger ? "#ef4444" : "#2563eb";
  const track = danger ? "#fde2e2" : "#dbe7fe";

  return (
    <svg className="bm-donut-svg" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke={track} strokeWidth="16" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="16"
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="60" textAnchor="middle" dominantBaseline="central" className="bm-donut-label">
        {label}
      </text>
    </svg>
  );
}

export default function BudgetManagePage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [hasBudget, setHasBudget] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  // 예산 입력 통화 (기본: 예산 페이지 표시 통화 → 없으면 KRW)
  const [budgetCurrency, setBudgetCurrency] = useState(
    () => localStorage.getItem(`tripCurrency:${tripId}`) ?? "KRW"
  );

  const load = async () => {
    if (!tripId) return;
    try {
      const [budgetRes, expenseList, table] = await Promise.all([
        getBudgets(tripId),
        getExpenses(tripId),
        getKrwRateTable(),
      ]);

      const budgets = budgetRes?.budgets ?? [];
      setHasBudget(budgets.length > 0);
      setSummary(
        computeSummary(
          budgets,
          Array.isArray(expenseList) ? expenseList : [],
          table
        )
      );

      // 모달 초기값을 기존 예산으로 채움 (총예산 행 포함)
      const prefill: Record<string, string> = {};
      for (const b of budgets) {
        prefill[b.category] = String(Math.round(Number(b.amount)));
      }
      setInputs(prefill);

      // 기존 예산에 저장된 통화가 있으면 그걸 사용
      const savedCurrency = budgets.find((b: any) => b.currency)?.currency;
      if (savedCurrency) {
        setBudgetCurrency(String(savedCurrency).toUpperCase());
      }
    } catch (error) {
      console.error("예산 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tripId]);

  const setField = (key: string, value: string) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  // 직접 입력하는 카테고리 (기타 제외)
  const editableCategoryKeys = CATEGORIES.filter(
    (c) => c.key !== ETC_KEY
  ).map((c) => c.key);

  // 기타 = 총예산 - (교통+숙소+음식+관광+쇼핑), 음수면 0
  const computedEtc = Math.max(
    0,
    toNum(inputs[TOTAL_KEY]) -
      editableCategoryKeys.reduce((s, k) => s + toNum(inputs[k]), 0)
  );

  const handleSave = async () => {
    if (!tripId) return;

    // 총예산 + 직접입력 카테고리 + 자동계산된 기타 (값이 있는 것만)
    const budgets = [
      { category: TOTAL_KEY, amount: toNum(inputs[TOTAL_KEY]) },
      ...editableCategoryKeys.map((k) => ({
        category: k,
        amount: toNum(inputs[k]),
      })),
      { category: ETC_KEY, amount: computedEtc },
    ]
      .filter((b) => b.amount > 0)
      .map((b) => ({ ...b, currency: budgetCurrency }));

    try {
      await upsertBudgets(tripId, budgets);
      setIsModalOpen(false);
      setLoading(true);
      await load();
    } catch (error) {
      console.error("예산 저장 실패:", error);
      alert("예산 저장에 실패했습니다.");
    }
  };

  // 진행바 총액: "총예산" 행을 우선 사용 (없으면 전체 합으로 폴백)
  const totalBudget =
    summary?.category_stats?.[TOTAL_KEY]?.budget ??
    summary?.total_budget_krw ??
    0;
  const totalExpense = summary?.total_expense_krw ?? 0;
  const usedPercent = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;
  const barDanger = usedPercent >= 100;
  const barWarning = !barDanger && usedPercent >= CATEGORY_DANGER_THRESHOLD;

  return (
    <div className="app-container">
      <div className="bm-page">
        <header className="bm-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h1>예산</h1>
        </header>

        {loading ? (
          <p className="bm-empty-text">불러오는 중...</p>
        ) : !hasBudget ? (
          <div className="bm-empty">
            <button
              className="budget-setting-btn"
              onClick={() => setIsModalOpen(true)}
            >
              예산 설정하기
            </button>
          </div>
        ) : (
          <>
            {/* 사용 / 총 예산 진행바 */}
            <div className="bm-progress-wrap">
              {barDanger && <span className="bm-progress-alert">❗</span>}
              <div className="bm-progress-track">
                <div
                  className={`bm-progress-fill ${
                    barDanger ? "danger" : barWarning ? "warning" : ""
                  }`}
                  style={{ width: `${Math.min(usedPercent, 100)}%` }}
                />
              </div>
              <div className="bm-progress-labels">
                <span>사용</span>
                <span>총 예산</span>
              </div>
            </div>

            {/* 카테고리 도넛 그리드 */}
            <div className="bm-grid">
              {CATEGORIES.map((c) => {
                const stat = summary?.category_stats?.[c.key] ?? {
                  budget: 0,
                  expense: 0,
                };
                const percent =
                  stat.budget > 0 ? (stat.expense / stat.budget) * 100 : 0;
                const remaining = stat.budget - stat.expense;
                const danger = percent >= CATEGORY_DANGER_THRESHOLD;

                return (
                  <div className="bm-cell" key={c.key}>
                    <Donut label={c.key} percent={percent} danger={danger} />
                    <div className="bm-cell-meta">
                      <span className={`bm-dot ${danger ? "danger" : ""}`} />
                      <span className={`bm-percent ${danger ? "danger" : ""}`}>
                        {percent.toFixed(1).replace(/\.0$/, "")} %
                      </span>
                      <span className="bm-remain">잔여 {formatMoney(remaining)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="budget-setting-btn bm-edit-btn"
              onClick={() => setIsModalOpen(true)}
            >
              예산 설정하기
            </button>
          </>
        )}

        {/* 예산 설정 모달 */}
        {isModalOpen && (
          <div className="budget-modal-backdrop">
            <div className="budget-modal">
              <button
                className="budget-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
              <h2>예산 설정</h2>

              {/* 예산 입력 통화 (모든 카테고리에 일괄 적용) */}
              <div className="budget-input-row">
                <label>통화</label>
                <CurrencySelect
                  value={budgetCurrency}
                  onChange={setBudgetCurrency}
                />
              </div>

              <div className="budget-input-row">
                <label>총 예산</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatNumberInput(inputs[TOTAL_KEY] ?? "")}
                  onChange={(e) => setField(TOTAL_KEY, digitsOnly(e.target.value))}
                />
              </div>

              {CATEGORIES.map((c) =>
                c.key === ETC_KEY ? (
                  <div className="budget-input-row" key={c.key}>
                    <label>{c.key}</label>
                    <input
                      type="text"
                      readOnly
                      title="총예산 - 나머지 카테고리로 자동 계산됩니다"
                      value={formatNumberInput(String(computedEtc))}
                    />
                  </div>
                ) : (
                  <div className="budget-input-row" key={c.key}>
                    <label>{c.key}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={formatNumberInput(inputs[c.key] ?? "")}
                      onChange={(e) => setField(c.key, digitsOnly(e.target.value))}
                    />
                  </div>
                )
              )}

              <button className="budget-complete-btn" onClick={handleSave}>
                설정 완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
