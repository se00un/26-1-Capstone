import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExpenses } from "../api/expenseAPI";
import { formatMoney } from "../utils/money";
import "./SettlementPage.css";

// 정산 화면 (틀)
// 공동 지출 선택 + 합계까지는 실제 데이터로 동작.
// 멤버 1/N 분할은 백엔드에 "트립 멤버 목록 API"가 없어 보류.
// TODO(api): GET /api/trips/{tripId}/members (멤버 user_id/닉네임) 추가되면
//   - 아래 members 를 실제 목록으로 교체
//   - POST /api/expenses/{expenseId}/split { user_ids } 로 분할 저장
export default function SettlementPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [shared, setShared] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [view, setView] = useState<"select" | "result">("select");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!tripId) return;
      try {
        const list = await getExpenses(tripId);
        setShared(
          (Array.isArray(list) ? list : []).filter(
            (e) => e.expense_type === "shared"
          )
        );
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
    (sum, e) => sum + Number(e.amount_krw ?? e.amount_original ?? 0),
    0
  );

  // TODO(api): 멤버 목록 API 연동 전까지 분할 인원/명단을 알 수 없음
  const members: { id: number; nickname: string }[] = [];

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
                <span>{formatMoney(Number(e.amount_krw ?? e.amount_original ?? 0))}</span>
              </div>
            ))}
            <div className="settle-result-row total">
              <span>합계</span>
              <span className="settle-total">{formatMoney(total)}</span>
            </div>
          </div>

          <div className="settle-members">
            {members.length === 0 ? (
              <p className="settle-todo">
                멤버별 1/N 정산은 멤버 목록 API 연동 후 표시됩니다.
              </p>
            ) : (
              members.map((m) => (
                <div className="settle-member-row" key={m.id}>
                  <span className="settle-avatar">👤</span>
                  <span className="settle-member-name">{m.nickname}</span>
                  <span>{formatMoney(total / members.length)}</span>
                </div>
              ))
            )}
          </div>

          <button
            className="settle-confirm-btn"
            onClick={() => navigate(`/trips/${tripId}/budget`)}
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
                {formatMoney(Number(e.amount_krw ?? e.amount_original ?? 0))}
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
