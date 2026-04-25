import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./AddSchedulePage.css";

export default function AddSchedulePage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();

  const day = searchParams.get("day") ?? "1";

  const [place, setPlace] = useState("");
  const [memo, setMemo] = useState("");

  const handleAddSchedule = () => {
    if (!place) {
      alert("여행지를 입력해주세요.");
      return;
    }

    const key = `schedule-${tripId}`;
    const savedSchedules = JSON.parse(localStorage.getItem(key) || "[]");

    const placeCoordinates: Record<string, { lat: number; lng: number }> = {
      신주쿠: { lat: 35.6938, lng: 139.7034 },
      아사쿠사: { lat: 35.7148, lng: 139.7967 },
      긴자: { lat: 35.6717, lng: 139.765 },
      오다이바: { lat: 35.6272, lng: 139.7768 },
      도쿄역: { lat: 35.6812, lng: 139.7671 },
      시부야: { lat: 35.6595, lng: 139.7005 },
    };

    const trimmedPlace = place.trim();

    const coordinate = placeCoordinates[trimmedPlace] || {
      lat: 35.6762,
      lng: 139.6503,
    };

    const newSchedule = {
      id: Date.now(),
      day,
      place: trimmedPlace,
      memo,
      lat: coordinate.lat,
      lng: coordinate.lng,
    };

    const updatedSchedules = [...savedSchedules, newSchedule];

    localStorage.setItem(key, JSON.stringify(updatedSchedules));

    navigate(`/trips/${tripId}`);
  };


  return (
    <div className="app-container">
      <div className="add-schedule-page">
        <header className="add-schedule-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>
          <div>
            <h1>일정 추가</h1>
            <p>{day}일차</p>
          </div>
        </header>

        <div className="form-group">
          <label>여행지</label>
          <input
            type="text"
            placeholder="예: 신주쿠"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>메모</label>
          <textarea
            placeholder="메모를 입력하세요"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        <button className="primary-btn" onClick={handleAddSchedule}>
          추가하기
        </button>
      </div>
    </div>
  );
}