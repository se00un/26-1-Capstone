import { getMyTrips, deleteTrip } from "../api/tripAPI";
import { createRoute, getRoutesByTripId } from "../api/routeAPI";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobeSection from "../components/GlobeSection";
import "./MainPage.css";

export default function MainPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);

  const loadTrips = async () => {
    try {
      console.log("accessToken:", localStorage.getItem("accessToken"));

      const data = await getMyTrips();
      console.log("my trips:", data);

      const tripsWithPins = await Promise.all(
        data.map(async (trip: any) => {
          try {
            const routes = await getRoutesByTripId(trip.id);
            console.log(`${trip.title} routes:`, routes);

            const places = routes.flatMap((route: any) => route.places || []);
            const firstPlace = places[0];

            return {
              ...trip,
              lat: firstPlace?.latitude ?? null,
              lng: firstPlace?.longitude ?? null,
            };
          } catch (routeErr) {
            console.error(`${trip.title} route 조회 실패:`, routeErr);

            return {
              ...trip,
              lat: null,
              lng: null,
            };
          }
        })
      );

      console.log("tripsWithPins:", tripsWithPins);
      setTrips(tripsWithPins);
    } catch (err) {
      console.error("내 여행 목록 조회 실패:", err);
    }
  };


  useEffect(() => {
    loadTrips();
  }, []);


  const tripPins = useMemo(
    () =>
      trips
        .filter((trip) => trip.lat != null && trip.lng != null)
        .map((trip) => ({
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

    const handleDeleteTrip = async (
    e: React.MouseEvent,
    tripId: number
  ) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "이 여행을 삭제하시겠습니까?"
    );

    if (!confirmed) return;

    try {
      await deleteTrip(tripId);

      loadTrips();
    } catch (error) {
      console.error("여행 삭제 실패:", error);
      alert("여행 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="app-container">
      <div className="main-page">
        <header className="main-header">
          <h1 className="logo">TripLog</h1>
          <button className="profile-btn">👤</button>
        </header>
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
                  <div className="trip-date">
                    {trip.date ?? `${trip.start_date} ~ ${trip.end_date}`}
                  </div>
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