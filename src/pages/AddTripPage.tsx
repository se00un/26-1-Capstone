import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddTripPage.css";
declare global {
  interface Window {
    google: any;
  }
}

export default function AddTripPage() {
  const navigate = useNavigate();

  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleAddTrip = () => {
    if (!country.trim() || !startDate || !endDate) {
      alert("국가와 날짜를 입력해주세요.");
      return;
    }

    if (!window.google || !window.google.maps) {
      alert("Google Maps가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }

    const trimmedCountry = country.trim();
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { address: trimmedCountry },
      (results: any, status: string) => {
        console.log("TRIP GEOCODING STATUS:", status);
        console.log("TRIP GEOCODING RESULTS:", results);

        if (status !== "OK" || !results || results.length === 0) {
          alert("해당 여행지의 위치를 찾을 수 없습니다.");
          return;
        }

        const location = results[0].geometry.location;
        const savedTrips = JSON.parse(localStorage.getItem("trips") || "[]");

        const newTrip = {
          id: Date.now(),
          title: `${trimmedCountry} 여행`,
          country: trimmedCountry,
          date: `${startDate} ~ ${endDate}`,
          startDate,
          endDate,
          emoji: "🌍",
          lat: location.lat(),
          lng: location.lng(),
          inviteCode,
          days: [],
        };

        localStorage.setItem("trips", JSON.stringify([...savedTrips, newTrip]));

        navigate("/");
      }
    );
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