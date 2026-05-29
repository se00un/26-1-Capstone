import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBudgets,
  getBudgetSummary,
  upsertBudgets,
} from "../api/budgetAPI";
import { CATEGORIES, CATEGORY_DANGER_THRESHOLD } from "../constants/categories";
import "./BudgetPage.css";
import "./BudgetManagePage.css";

// "총예산"은 카테고리와 별개로 사용자가 직접 입력하는 전체 예산 행
const TOTAL_KEY = "총예산";

type CategoryStat = { budget: number; expense: number };

type Summary = {
  total_budget_krw: number;
  total_expense_krw: number;
  burn_rate: number;
  risk_status: "safe" | "warning" | "danger";
  category_stats: Record<string, CategoryStat>;
};

const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
const toNum = (s?: string) => Number(String(s ?? "").replace(/[^0-9]/g, "")) || 0;

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

  const load = async () => {
    if (!tripId) return;
    try {
      const [budgetRes, summaryRes] = await Promise.all([
        getBudgets(tripId),
        getBudgetSummary(tripId),
      ]);

      const budgets = budgetRes?.budgets ?? [];
      setHasBudget(budgets.length > 0);
      setSummary(summaryRes);

      // 모달 초기값을 기존 예산으로 채움 (총예산 행 포함)
      const prefill: Record<string, string> = {};
      for (const b of budgets) {
        prefill[b.category] = String(Math.round(Number(b.amount)));
      }
      setInputs(prefill);
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

  const handleSave = async () => {
    if (!tripId) return;

    // 총예산 + 6개 카테고리 모두 저장 (값이 있는 것만)
    const keys = [TOTAL_KEY, ...CATEGORIES.map((c) => c.key)];
    const budgets = keys
      .map((key) => ({ category: key, amount: toNum(inputs[key]) }))
      .filter((b) => b.amount > 0);

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
                      <span className="bm-remain">잔여 {won(remaining)}</span>
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

              <div className="budget-input-row">
                <label>총 예산</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={inputs[TOTAL_KEY] ?? ""}
                  onChange={(e) => setField(TOTAL_KEY, e.target.value)}
                />
              </div>

              {CATEGORIES.map((c) => (
                <div className="budget-input-row" key={c.key}>
                  <label>{c.key}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={inputs[c.key] ?? ""}
                    onChange={(e) => setField(c.key, e.target.value)}
                  />
                </div>
              ))}

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
