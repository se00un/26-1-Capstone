import { createTrip } from "../api/tripAPI";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { acceptInvite } from "../api/inviteAPI";
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

  // 추가
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  // 추가
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.google?.maps) {
        setIsGoogleReady(true);
        clearInterval(timer);
      }
    }, 300);

    return () => clearInterval(timer);
  }, []);

  

  const handleAddTrip = async () => {
    if (inviteCode.trim()) {
      try {
        await acceptInvite(inviteCode.trim());
        alert("초대된 여행에 참여했습니다");
        navigate("/");
        return
      } catch (error) {
        console.error("초대 코드 참여 실패:", error);
        alert("초대 코드가 올바르지 않거나 만료되었습니다.");
        return;
      }
    }

    if (!country.trim() || !startDate || !endDate) {
      alert("국가와 날짜를 입력해주세요.");
      return;
    }

    if (!isGoogleReady || !window.google?.maps) {
      alert("지도 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
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

        console.log("여행 생성 요청 보냄");

        createTrip({
          title: `${trimmedCountry} 여행`,
          country: trimmedCountry,
          start_date: startDate,
          end_date: endDate,
          latitude: location.lat(),
          longitude: location.lng(),
        })
          .then(() => {
            navigate("/");
          })
          .catch((err) => {
            console.error("여행 생성 실패:", err);
            alert("여행 생성에 실패했습니다.");
          });
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

        <button
          className="primary-btn"
          onClick={handleAddTrip}
          disabled={!isGoogleReady}
        >
          {isGoogleReady ? "추가하기" : "지도 로딩 중..."}
        </button>
      </div>
    </div>
  );
}