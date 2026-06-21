import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createInvite } from "../api/inviteAPI";
import { getTripMembers } from "../api/tripAPI";
import { getExpenses } from "../api/expenseAPI";
import { formatMoney } from "../utils/money";
import { expenseToKrw, getKrwRateTable } from "../utils/currency";
import "./FriendsPage.css";

type Member = {
  user_id: number;
  nickname: string;
  profile_image_url: string | null;
  role: string;
};

export default function FriendsPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [members, setMembers] = useState<Member[]>([]);
  const [sharedExpenses, setSharedExpenses] = useState<any[]>([]);

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
        const [memberList, expenseList] = await Promise.all([
          getTripMembers(tripId),
          getExpenses(tripId),
        ]);
        setMembers(Array.isArray(memberList) ? memberList : []);
        setSharedExpenses(
          (Array.isArray(expenseList) ? expenseList : []).filter(
            (e) => e.expense_type === "shared"
          )
        );
      } catch (error) {
        console.error("친구 목록/정산 조회 실패:", error);
      }
    };
    load();
  }, [tripId]);

  // 정산하기에서 확정한 결과 (localStorage) — 있으면 이걸 우선 표시
  const savedSettlement: { totals?: Record<number, number> } | null = (() => {
    try {
      const raw = localStorage.getItem(`settlement:${tripId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // 최종 정산 (한화 기준, SettlementPage와 동일한 1/N 분할 로직)
  // 부담액 = 공동지출 합계 / N (반올림 차액은 첫 멤버), 선지불 = 본인이 결제한 공동지출 합
  // 정산액 = 부담액 - 선지불 (양수: 내야 함 / 음수: 돌려받음)
  const N = members.length;
  const totalShared = sharedExpenses.reduce(
    (sum, e) => sum + expenseToKrw(e, rateTable),
    0
  );
  const baseSplit = N > 0 ? Math.round(totalShared / N) : 0;
  const remainder = N > 0 ? totalShared - baseSplit * N : 0;

  const settlementOf = (member: Member, index: number): number => {
    // 1순위: 정산하기에서 확정·저장한 결과
    const saved = savedSettlement?.totals?.[member.user_id];
    if (typeof saved === "number") return saved;

    // 2순위: 전체 공동지출 기준 실시간 계산 (아직 정산 안 했을 때)
    const share = index === 0 ? baseSplit + remainder : baseSplit;
    const paid = sharedExpenses
      .filter((e) => e.created_by === member.user_id)
      .reduce((sum, e) => sum + expenseToKrw(e, rateTable), 0);
    return share - paid;
  };

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [createdInviteCode, setCreatedInviteCode] = useState("");

  const handleCreateInvite = async () => {
    try {
      if (!tripId) return;

      const data = await createInvite(tripId);
      setCreatedInviteCode(data.invite_code);
      setIsInviteModalOpen(true);
    } catch (error) {
      console.error("초대 코드 생성 실패:", error);
      alert("초대 코드 생성에 실패했습니다.");
    }
  };

  const handleCopyInviteCode = async () => {
    if (!createdInviteCode) return;

    await navigator.clipboard.writeText(createdInviteCode);
    alert("초대 코드가 복사되었습니다.");
    setIsInviteModalOpen(false);
  };

  return (
    <div className="app-container">
      <div className="friends-page">
        <header className="friends-header">
          <button className="back-btn" onClick={() => navigate(`/trips/${tripId}`)}>
            ✕
          </button>
          <h1>친구</h1>
        </header>

        <div className="friends-list">
          {members.map((member, i) => {
            const settle = settlementOf(member, i);
            return (
              <div className="friend-item member" key={member.user_id}>
                {/* 윗줄: 프사 / 이름 / 역할 */}
                <div className="friend-row-top">
                  {member.profile_image_url ? (
                    <img
                      className="avatar-img"
                      src={member.profile_image_url}
                      alt={member.nickname}
                    />
                  ) : (
                    <div className="avatar">👤</div>
                  )}
                  <span className="friend-name">{member.nickname}</span>
                  <span className={`role-badge ${member.role}`}>
                    {member.role}
                  </span>
                </div>

                {/* 아랫줄: 최종 정산 금액 (한화) */}
                <div className="friend-row-bottom">
                  <span className="friend-settle-label">정산</span>
                  <span
                    className={`friend-settle ${
                      settle > 0 ? "owe" : settle < 0 ? "receive" : ""
                    }`}
                  >
                    {settle > 0
                      ? `${formatMoney(settle)}₩ 내기`
                      : settle < 0
                      ? `${formatMoney(-settle)}₩ 받기`
                      : "정산 완료"}
                  </span>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            className="friend-item add-friend-row"
            onClick={handleCreateInvite}
          >
            <div className="friend-left">
              <div className="avatar">?</div>
              <span className="friend-name">친구 초대하기</span>
            </div>

            <span className="role-badge editor">+ editor</span>
          </button>
        </div>

        {isInviteModalOpen && (
          <div className="modal-backdrop">
            <div className="invite-modal">
              <button
                className="modal-close"
                onClick={() => setIsInviteModalOpen(false)}
              >
                ✕
              </button>

              <h2>친구 초대 코드</h2>

              <div className="invite-code-box">{createdInviteCode}</div>

              <button className="modal-add-btn" onClick={handleCopyInviteCode}>
                복사하기
              </button>
            </div>
          </div>
        )}

        <nav className="bottom-tab">
          <button onClick={() => navigate(`/trips/${tripId}`)}>일정</button>
          <button onClick={() => navigate(`/trips/${tripId}/budget`)}>
            예산
          </button>
          <button className="active-tab">친구</button>
          <button onClick={() => navigate(`/trips/${tripId}/report`)}>리포트
          </button>
        </nav>
      </div>
    </div>
  );
}