import { useNavigate, useParams } from "react-router-dom";
import RouteMap from "../components/RouteMap";
import "./TripDetailPage.css";

const defaultTripData: Record<
  string,
  {
    title: string;
    date: string;
    center: { lat: number; lng: number };
    places: { id: number; name: string; lat: number; lng: number }[];
    days: { day: string; date: string }[];
  }
> = {
  "1": {
    title: "일본 여행",
    date: "2026.04.02 - 04.06",
    center: { lat: 35.6762, lng: 139.6503 },
    places: [
      { id: 1, name: "신주쿠", lat: 35.6938, lng: 139.7034 },
      { id: 2, name: "아사쿠사", lat: 35.7148, lng: 139.7967 },
      { id: 3, name: "긴자", lat: 35.6717, lng: 139.765 },
      { id: 4, name: "오다이바", lat: 35.6272, lng: 139.7768 },
    ],
    days: [
      { day: "1일차", date: "4월 5일" },
      { day: "2일차", date: "4월 6일" },
      { day: "3일차", date: "4월 7일" },
    ],
  },
  "2": {
    title: "호주 여행",
    date: "2026.03.15 - 03.22",
    center: { lat: -33.8688, lng: 151.2093 },
    places: [
      { id: 1, name: "Sydney Opera House", lat: -33.8568, lng: 151.2153 },
      { id: 2, name: "Bondi Beach", lat: -33.8915, lng: 151.2767 },
      { id: 3, name: "Darling Harbour", lat: -33.8748, lng: 151.1982 },
    ],
    days: [
      { day: "1일차", date: "3월 15일" },
      { day: "2일차", date: "3월 16일" },
      { day: "3일차", date: "3월 17일" },
    ],
  },
};

export default function TripDetailPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const savedTrips = JSON.parse(localStorage.getItem("trips") || "[]");

  const savedTrip = savedTrips.find(
    (trip: any) => String(trip.id) === String(tripId)
  );

  const trip =
    defaultTripData[tripId ?? ""] ||
    (savedTrip && {
      title: savedTrip.title,
      date: savedTrip.date.replace("~", "-"),
      center: {
        lat: savedTrip.lat,
        lng: savedTrip.lng,
      },
      places: [],
      days: [
        { day: "1일차", date: "4월 5일" },
        { day: "2일차", date: "4월 6일" },
        { day: "3일차", date: "4월 7일" },
      ],
    });

  if (!trip) {
    return (
      <div className="app-container">
        <div className="detail-page">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ✕
          </button>
          <h1>존재하지 않는 여행입니다.</h1>
        </div>
      </div>
    );
  }

  const savedSchedules = JSON.parse(
    localStorage.getItem(`schedule-${tripId}`) || "[]"
  );

  const schedulePlaces = savedSchedules.map((schedule: any) => ({
    id: schedule.id,
    name: schedule.place,
    lat: schedule.lat,
    lng: schedule.lng,
  }));

  // 일정 삭제
  const handleDeleteSchedule = (scheduleId: number) => {
    const key = `schedule-${tripId}`;
    const savedSchedules = JSON.parse(localStorage.getItem(key) || "[]");

    const updatedSchedules = savedSchedules.filter(
      (item: any) => item.id !== scheduleId
    );

    localStorage.setItem(key, JSON.stringify(updatedSchedules));

    window.location.reload(); // 간단하게 리렌더
  };

  const mapPlaces = [...trip.places, ...schedulePlaces];

  return (
    <div className="app-container">
      <div className="detail-page">
        <header className="detail-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ✕
          </button>

          <div className="detail-title-group">
            <h1>{trip.title}</h1>
            <p>{trip.date}</p>
          </div>
        </header>

        <section className="map-preview">
          <RouteMap center={trip.center} places={mapPlaces} />
        </section>

        <section className="day-section">
          {trip.days.map((item, index) => {
            const daySchedules = savedSchedules.filter(
              (schedule: any) => String(schedule.day) === String(index + 1)
            );

            return (
              <div className="day-card" key={item.day}>
                <div className="day-card-header">
                  <div className="day-title">
                    <strong>{item.day}</strong>
                    <span>{item.date}</span>
                  </div>

                  <button
                    className="add-btn"
                    onClick={() =>
                      navigate(`/trips/${tripId}/schedule/new?day=${index + 1}`)
                    }
                  >
                    추가
                  </button>
                </div>

                {daySchedules.length > 0 && (
                  <div className="schedule-list">
                    {daySchedules.map((schedule: any, scheduleIndex: number) => (
                      <div className="schedule-item" key={schedule.id}>
                        <div className="schedule-number">{scheduleIndex + 1}</div>

                        <div className="schedule-content">
                          <p className="schedule-place">{schedule.place}</p>
                          {schedule.memo && (
                            <p className="schedule-memo">{schedule.memo}</p>
                          )}
                        </div>
          
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          ✕
                        </button>
                        
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <nav className="bottom-tab">
          <button className="active-tab">일정</button>
          <button>예산</button>
          <button>친구</button>
          <button>리포트</button>
        </nav>
      </div>
    </div>
  );
}