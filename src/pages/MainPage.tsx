import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobeSection from "../components/GlobeSection";
import "./MainPage.css";

export default function MainPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);

  const loadTrips = () => {
    const savedTrips = JSON.parse(localStorage.getItem("trips") || "[]");
    setTrips(savedTrips);
  };

  useEffect(() => {
    loadTrips();
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

  const handleDeleteTrip = (e: React.MouseEvent, tripId: number) => {
    e.stopPropagation();

    const savedTrips = JSON.parse(localStorage.getItem("trips") || "[]");

    const updatedTrips = savedTrips.filter(
      (trip: any) => Number(trip.id) !== Number(tripId)
    );

    localStorage.setItem("trips", JSON.stringify(updatedTrips));
    localStorage.removeItem(`schedule-${tripId}`);

    loadTrips();
  };

  return (
    <div className="app-container">
      <div className="main-page">
        <header className="main-header">
          <h1 className="logo">TripLog</h1>
          <button className="profile-btn">👤</button>
        </header>

        {/* <button
          className="add-trip-btn"
          onClick={() => navigate("/trips/new")}
        >
          여행 추가
        </button> */}

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
              <div
                key={trip.id}
                className="trip-item"
                onClick={() => handleTripClick(trip.id)}
              >
                <div className="trip-flag">{trip.emoji}</div>

                <div className="trip-info">
                  <div className="trip-title">{trip.title}</div>
                  <div className="trip-date">{trip.date}</div>
                </div>

                <button
                  type="button"
                  className="trip-delete-btn"
                  onClick={(e) => handleDeleteTrip(e, trip.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

          <button
            className="fixed-add-trip-btn"
            onClick={() => navigate("/trips/new")}
          >
            + 여행 추가
          </button>
      </div>
    </div>
  );
}