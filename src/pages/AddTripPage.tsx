import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddTripPage.css";

export default function AddTripPage() {
  const navigate = useNavigate();

  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleAddTrip = () => {
    if (!country || !startDate || !endDate) {
      alert("국가와 날짜를 입력해주세요.");
      return;
    }

    const savedTrips = JSON.parse(localStorage.getItem("trips") || "[]");

    const newTrip = {
      id: Date.now(),
      title: `${country} 여행`,
      country,
      date: `${startDate} ~ ${endDate}`,
      emoji: "🌍",
      lat: 35.6895,
      lng: 139.6917,
      inviteCode,
      days: [],
    };

    const updatedTrips = [...savedTrips, newTrip];
    localStorage.setItem("trips", JSON.stringify(updatedTrips));

    navigate("/");
  };

  return (
    <div className="app-container">
      <div className="add-trip-page">
        <header className="add-trip-header">
          <button className="close-btn" onClick={() => navigate(-1)}>
            ✕
          </button>
          <h1>여행 추가</h1>
        </header>

        <div className="form-group">
          <label>국가</label>
          <input
            type="text"
            placeholder="예: 일본"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>가는 날</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>오는 날</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>초대 코드</label>
          <input
            type="text"
            placeholder="초대 코드가 있으면 입력"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        </div>

        <button className="primary-btn" onClick={handleAddTrip}>
          추가하기
        </button>
      </div>
    </div>
  );
}