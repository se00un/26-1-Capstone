import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createInvite } from "../api/inviteAPI";
import "./FriendsPage.css";

type Member = {
  id: number;
  name: string;
  role: "owner" | "editor";
};

export default function FriendsPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [members] = useState<Member[]>([
    { id: 1, name: "닉네임", role: "owner" },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [createdInviteCode, setCreatedInviteCode] = useState("");

  const handleCreateInvite = async () => {
    try {
      if (!tripId) return;

      const data = await createInvite(tripId);

      console.log("초대 코드 생성:", data);

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
          <button className="back-btn" onClick={() => navigate(-1)}>
            ✕
          </button>
          <h1>친구</h1>
        </header>

        <div className="friends-list">
          {members.map((member) => (
            <div className="friend-item" key={member.id}>
              <div className="friend-left">
                <div className="avatar">👤</div>
                <span className="friend-name">{member.name}</span>
              </div>

              <span className={`role-badge ${member.role}`}>
                {member.role}
              </span>
            </div>
          ))}

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
      </div>
    </div>
  );
}