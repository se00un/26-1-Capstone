import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobeSection from "../components/GlobeSection";
import "./MainPage.css";

const defaultTrips = [
  {
    id: 1,
    title: "일본 여행",
    country: "Japan",
    date: "2026-04-02 ~ 2026-04-06",
    lat: 35.6895,
    lng: 139.6917,
    emoji: "🇯🇵",
  },
  {
    id: 2,
    title: "호주 여행",
    country: "Australia",
    date: "2026-03-15 ~ 2026-03-22",
    lat: -33.8688,
    lng: 151.2093,
    emoji: "🇦🇺",
  },
];

export default function MainPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState(defaultTrips);

  useEffect(() => {
    const savedTrips = JSON.parse(localStorage.getItem("trips") || "[]");
    if (savedTrips.length > 0) {
      setTrips([...defaultTrips, ...savedTrips]);
    }
  }, []);

  const tripPins = useMemo(
    () =>
      trips.map((trip) => ({
        id: trip.id,
        title: trip.title,
        lat: trip.lat,
        lng: trip.lng,
      })),
    [trips]
  );

  const handleTripClick = (tripId: number) => {
    navigate(`/trips/${tripId}`);
  };

  return (
    <div className="app-container">
      <div className="main-page">
        <header className="main-header">
          <h1 className="logo">TripLog</h1>
          <button className="profile-btn">👤</button>
        </header>

        <button
          className="add-trip-btn"
          onClick={() => navigate("/trips/new")}
        >
          여행 추가
        </button>

        <section className="globe-card">
          <GlobeSection trips={tripPins} onPinClick={handleTripClick} />
        </section>

        <section className="trip-list-section">
          <div className="trip-list-header">
            <h2>내 여행</h2>
            <button className="sort-btn">⇅</button>
          </div>

          <div className="trip-list">
            {trips.map((trip) => (
              <button
                key={trip.id}
                className="trip-item"
                onClick={() => handleTripClick(trip.id)}
              >
                <div className="trip-flag">{trip.emoji}</div>
                <div className="trip-info">
                  <div className="trip-title">{trip.title}</div>
                  <div className="trip-date">{trip.date}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}