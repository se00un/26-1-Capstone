import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./AddSchedulePage.css";
declare const google: any;

export default function AddSchedulePage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();

  const day = searchParams.get("day") ?? "1";
  
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const [place, setPlace] = useState("");
  const [memo, setMemo] = useState("");

  const handleAddSchedule = () => {
    if (!place.trim()) {
      alert("여행지를 입력해주세요.");
      return;
    }

    const trimmedPlace = place.trim();

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode(
      {
        address: trimmedPlace,
        location:
          lat && lng
            ? new google.maps.LatLng(Number(lat), Number(lng))
            : undefined,
      },
      (results: any, status: string) => {
        console.log("GEOCODING STATUS:", status);
        console.log("GEOCODING RESULTS:", results);

        if (status !== "OK" || !results || results.length === 0) {
          alert("해당 장소의 위치를 찾을 수 없습니다.");
          return;
        }

        const location = results[0].geometry.location;

        const key = `schedule-${tripId}`;
        const savedSchedules = JSON.parse(localStorage.getItem(key) || "[]");

        const newSchedule = {
          id: Date.now(),
          day,
          place: trimmedPlace,
          memo,
          lat: location.lat(),
          lng: location.lng(),
        };

        const updatedSchedules = [...savedSchedules, newSchedule];

        localStorage.setItem(key, JSON.stringify(updatedSchedules));

        navigate(`/trips/${tripId}`);
      }
    );
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