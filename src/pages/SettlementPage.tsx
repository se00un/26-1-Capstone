import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExpenses } from "../api/expenseAPI";
import { getTripMembers } from "../api/tripAPI";
import { formatMoney } from "../utils/money";
import { expenseToKrw, getKrwRateTable } from "../utils/currency";
import "./SettlementPage.css";

type TripMember = {
  user_id: number;
  email: string;
  nickname: string;
  profile_image_url: string | null;
  role: string;
};

// 정산 화면
// 공동 지출 선택 → 합계 → 멤버 목록 API 기반 1/N 분할 표시
export default function SettlementPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [shared, setShared] = useState<any[]>([]);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [view, setView] = useState<"select" | "result">("select");
  const [loading, setLoading] = useState(true);

  // KRW 기준 환율 테이블 (잘못 저장된 amount_krw 보정용)
  const [rateTable, setRateTable] = useState<Record<string, number> | null>(
    null
  );
  useEffect(() => {
    getKrwRateTable().then(setRateTable);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!tripId) return;
      try {
        const [list, memberList] = await Promise.all([
          getExpenses(tripId),
          getTripMembers(tripId),
        ]);
        setShared(
          (Array.isArray(list) ? list : []).filter(
            (e) => e.expense_type === "shared"
          )
        );
        setMembers(Array.isArray(memberList) ? memberList : []);
      } catch (error) {
        console.error("정산 대상 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tripId]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === shared.length
        ? new Set()
        : new Set(shared.map((e) => e.id))
    );
  };

  const selectedExpenses = shared.filter((e) => selected.has(e.id));
  const total = selectedExpenses.reduce(
    (sum, e) => sum + expenseToKrw(e, rateTable),
    0
  );

  // 1/N 분할 — 백엔드 split 로직과 동일하게 반올림하고 남는 차액은 첫 멤버에게
  const N = members.length;
  const baseSplit = N > 0 ? Math.round(total / N) : 0;
  const remainder = N > 0 ? total - baseSplit * N : 0;
  const splitAmount = (index: number) =>
    index === 0 ? baseSplit + remainder : baseSplit;

  // 정산 확정: 멤버별 순정산(부담액-선지불)을 여행별로 저장하고 친구탭으로 이동.
  // 백엔드에 정산 저장 API가 없어 localStorage 사용 (친구탭이 이 결과를 우선 표시)
  const handleConfirmSettlement = () => {
    const totals: Record<number, number> = {};
    members.forEach((m, i) => {
      const paid = selectedExpenses
        .filter((e) => e.created_by === m.user_id)
        .reduce(
          (sum, e) => sum + expenseToKrw(e, rateTable),
          0
        );
      totals[m.user_id] = splitAmount(i) - paid;
    });
    localStorage.setItem(
      `settlement:${tripId}`,
      JSON.stringify({ savedAt: new Date().toISOString(), total, totals })
    );
    navigate(`/trips/${tripId}/friends`);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="settle-page">
          <h1>불러오는 중...</h1>
        </div>
      </div>
    );
  }

  if (view === "result") {
    return (
      <div className="app-container">
        <div className="settle-page">
          <header className="settle-header">
            <button className="back-btn" onClick={() => setView("select")}>
              &lt;
            </button>
            <h1>정산하기</h1>
          </header>

          <div className="settle-result-list">
            {selectedExpenses.map((e) => (
              <div className="settle-result-row" key={e.id}>
                <span>{e.title}</span>
                <span>{formatMoney(expenseToKrw(e, rateTable))}</span>
              </div>
            ))}
            <div className="settle-result-row total">
              <span>합계</span>
              <span className="settle-total">{formatMoney(total)}</span>
            </div>
          </div>

          <div className="settle-members">
            <div className="settle-members-label">
              {N}명 · 1인당 {formatMoney(baseSplit)}
            </div>
            {members.length === 0 ? (
              <p className="settle-todo">여행 멤버를 불러오지 못했습니다.</p>
            ) : (
              members.map((m, i) => (
                <div className="settle-member-row" key={m.user_id}>
                  {m.profile_image_url ? (
                    <img
                      className="settle-avatar-img"
                      src={m.profile_image_url}
                      alt={m.nickname}
                    />
                  ) : (
                    <span className="settle-avatar">👤</span>
                  )}
                  <span className="settle-member-name">
                    {m.nickname}
                    {m.role === "owner" && (
                      <span className="settle-member-role">방장</span>
                    )}
                  </span>
                  <span className="settle-member-amount">
                    {formatMoney(splitAmount(i))}
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            className="settle-confirm-btn"
            onClick={handleConfirmSettlement}
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="settle-page">
        <header className="settle-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h1>정산</h1>
        </header>

        <button className="settle-check-row select-all" onClick={toggleAll}>
          <span className={`settle-check ${selected.size === shared.length && shared.length > 0 ? "on" : ""}`} />
          <span>전체선택</span>
        </button>

        <div className="settle-section-label">&lt;공동 지출 내역&gt;</div>

        <div className="settle-list">
          {shared.map((e) => (
            <button
              type="button"
              className="settle-check-row"
              key={e.id}
              onClick={() => toggle(e.id)}
            >
              <span className={`settle-check ${selected.has(e.id) ? "on" : ""}`} />
              <span className="settle-item-info">
                <span className="settle-item-title">{e.title}</span>
                <span className="settle-item-date">{e.expense_date}</span>
              </span>
              <span className="settle-item-amount">
                {formatMoney(expenseToKrw(e, rateTable))}
              </span>
            </button>
          ))}
          {shared.length === 0 && (
            <p className="settle-todo">공동 지출 내역이 없습니다.</p>
          )}
        </div>

        <button
          className="settle-confirm-btn"
          disabled={selected.size === 0}
          onClick={() => setView("result")}
        >
          정산하기
        </button>
      </div>
    </div>
  );
}
