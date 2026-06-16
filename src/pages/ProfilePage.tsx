import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../api/userAPI";
import "./ProfilePage.css";

type Profile = {
  nickname?: string;
  name?: string;
  email?: string;
  profile_image_url?: string;
  picture?: string;
  created_at?: string;
};

export default function ProfilePage() {
  const navigate = useNavigate();

  // 우선 localStorage 정보로 표시
  const [profile, setProfile] = useState<Profile | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await getMe();
        setProfile(me);
      } catch (error) {
        console.error("내 정보 조회 실패:", error);
        // 실패 시 localStorage 정보 그대로 사용
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmed) return;

    localStorage.clear();
    window.location.href = "/login";
  };

  const displayName = profile?.nickname ?? profile?.name ?? "사용자";
  const email = profile?.email ?? "";
  const imageUrl = profile?.profile_image_url ?? profile?.picture ?? "";
  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("ko-KR")
    : null;

  return (
    <div className="app-container">
      <div className="profile-page">
        <header className="profile-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            ✕
          </button>
          <h1>내 정보</h1>
        </header>

        <section className="profile-card">
          <div className="profile-avatar">
            {imageUrl ? <img src={imageUrl} alt="프로필" /> : <span>👤</span>}
          </div>

          <div className="profile-name">{displayName}</div>
          {email && <div className="profile-email">{email}</div>}
          {joinedAt && <div className="profile-joined">가입일 · {joinedAt}</div>}
        </section>

        <section className="profile-actions">
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </section>
      </div>
    </div>
  );
}
