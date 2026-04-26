import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FriendsPage.css";

type Member = {
  id: number;
  name: string;
  role: "owner" | "editor";
};

export default function FriendsPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const storageKey = `friends-${tripId}`;

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      return JSON.parse(saved);
    }

    return [{ id: 1, name: "나", role: "owner" }];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleAddFriend = () => {
    if (!inviteCode.trim()) {
      alert("초대 코드를 입력해주세요.");
      return;
    }

    const newFriend: Member = {
      id: Date.now(),
      name: `친구 ${members.length}`,
      role: "editor",
    };

    const updatedMembers = [...members, newFriend];

    setMembers(updatedMembers);
    localStorage.setItem(storageKey, JSON.stringify(updatedMembers));

    setInviteCode("");
    setIsModalOpen(false);
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
        </div>

        <div className="invite-section">
          <button className="invite-btn" onClick={() => setIsModalOpen(true)}>
            친구 초대하기
          </button>
        </div>

        {isModalOpen && (
          <div className="modal-backdrop">
            <div className="invite-modal">
              <button
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>

              <h2>친구 초대 코드</h2>

              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="초대 코드를 입력하세요"
              />

              <button className="modal-add-btn" onClick={handleAddFriend}>
                추가하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}