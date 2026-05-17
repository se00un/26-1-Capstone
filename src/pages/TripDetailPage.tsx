import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RouteMap from "../components/RouteMap";
import SortableScheduleItem from "../components/SortableScheduleItem";
import { getMyTrips } from "../api/tripAPI";
import {
  getRoutesByTripId,
  deletePlaceFromRoute,
  updateRoutePlaceOrder,
} from "../api/routeAPI";
import "./TripDetailPage.css";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

const createTripDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const days = [];
  let current = new Date(start);
  let index = 1;

  while (current <= end) {
    days.push({
      day: `${index}일차`,
      date: `${current.getMonth() + 1}월 ${current.getDate()}일`,
    });

    current.setDate(current.getDate() + 1);
    index++;
  }

  return days;
};

export default function TripDetailPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [trip, setTrip] = useState<any>(null);
  const [savedSchedules, setSavedSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("1");

  const loadTripDetail = async () => {
    try {
      if (!tripId) return;

      const trips = await getMyTrips();
      const foundTrip = trips.find(
        (item: any) => String(item.id) === String(tripId)
      );

      if (!foundTrip) {
        setTrip(null);
        return;
      }

      const routes = await getRoutesByTripId(tripId);
      console.log("routes:", routes);

      const days = createTripDays(foundTrip.start_date, foundTrip.end_date);

      const schedules = routes.flatMap((route: any) =>
        (route.places || []).map((place: any, index: number) => ({
          id: place.id,
          routeId: route.id,
          day: route.title?.replace("일차", "") || "1",
          place: place.place_name,
          memo: place.memo,
          lat: place.latitude,
          lng: place.longitude,
          visit_order: place.visit_order ?? index + 1,
        }))
      );

      const mapPlaces = savedSchedules
      .filter(
        (schedule: any) => String(schedule.day) === selectedDay
      )
      .sort(
        (a: any, b: any) => a.visit_order - b.visit_order
      )
      .map((schedule: any) => ({
        id: schedule.id,
        name: schedule.place,
        lat: schedule.lat,
        lng: schedule.lng,
      }));

      const firstPlace = mapPlaces[0];

      // const tripCenter =
      //   foundTrip.lat != null && foundTrip.lng != null
      //     ? {
      //         lat: Number(foundTrip.lat),
      //         lng: Number(foundTrip.lng),
      //       }
      //     : firstPlace
      //       ? {
      //           lat: Number(firstPlace.lat),
      //           lng: Number(firstPlace.lng),
      //         }
      //       : {
      //           lat: 37.5665,
      //           lng: 126.978,
      //         };

      // setTrip({
      //   id: foundTrip.id,
      //   title: foundTrip.title,
      //   date: `${foundTrip.start_date} - ${foundTrip.end_date}`,
      //   // center: firstPlace
      //   //   ? { lat: firstPlace.lat, lng: firstPlace.lng }
      //   //   : { lat: 37.5665, lng: 126.978 },
      //   center: tripCenter,
      //   days,
      // });

      const tripCenter = firstPlace
        ? {
            lat: Number(firstPlace.lat),
            lng: Number(firstPlace.lng),
          }
        : {
            lat: 37.5665,
            lng: 126.978,
          };

      setTrip({
        id: foundTrip.id,
        title: foundTrip.title,
        date: `${foundTrip.start_date} - ${foundTrip.end_date}`,
        center: tripCenter,
        days,
      });
      

      setSavedSchedules(schedules);
    } catch (error) {
      console.error("여행 상세 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripDetail();
  }, [tripId]);

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      const target = savedSchedules.find((item) => item.id === scheduleId);

      if (!target) return;

      await deletePlaceFromRoute(target.routeId, target.id);

      setSavedSchedules((prev) =>
        prev.filter((item) => item.id !== scheduleId)
      );
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItem = savedSchedules.find(
      (item: any) => item.id === active.id
    );
    const overItem = savedSchedules.find((item: any) => item.id === over.id);

    if (!activeItem || !overItem) return;
    if (activeItem.day !== overItem.day) return;

    const sameDayItems = savedSchedules.filter(
      (item: any) => item.day === activeItem.day
    );

    const oldIndex = sameDayItems.findIndex(
      (item: any) => item.id === active.id
    );
    const newIndex = sameDayItems.findIndex(
      (item: any) => item.id === over.id
    );

    const reordered = arrayMove(sameDayItems, oldIndex, newIndex);

    const updated = savedSchedules.map((item: any) => {
      if (item.day !== activeItem.day) return item;
      return reordered.shift();
    });

    setSavedSchedules(updated);

    try {
      const orderedPlaceIds = updated
        .filter((item: any) => item.day === activeItem.day)
        .map((item: any) => item.id);

      await updateRoutePlaceOrder(activeItem.routeId, orderedPlaceIds);
    } catch (error) {
      console.error("순서 변경 저장 실패:", error);
    }
  };

  const mapPlaces = savedSchedules.map((schedule: any) => ({
    id: schedule.id,
    name: schedule.place,
    lat: schedule.lat,
    lng: schedule.lng,
  }));

  if (loading) {
    return (
      <div className="app-container">
        <div className="detail-page">
          <h1>불러오는 중...</h1>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="app-container">
        <div className="detail-page">
          <button className="back-btn" onClick={() => navigate("/")}>
            ✕
          </button>
          <h1>존재하지 않는 여행입니다.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="detail-page">
        <header className="detail-header">
          <button className="back-btn" onClick={() => navigate("/")}>
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
          {trip.days.map((item: { day: string; date: string }, index: number) => {
            const dayNumber = String(index + 1);

            const daySchedules = savedSchedules.filter(
              (schedule: any) => String(schedule.day) === dayNumber
            );

            return (
              // <div className="day-card" key={item.day}>
              <div
                className={`day-card ${
                  selectedDay === dayNumber ? "selected-day" : ""
                }`}
                key={item.day}
                onClick={() => setSelectedDay(dayNumber)}
              >
                <div className="day-card-header">
                  <div className="day-title">
                    <strong>{item.day}</strong>
                    <span>{item.date}</span>
                  </div>

                  <button
                    className="add-btn"
                    onClick={() =>
                      navigate(
                        `/trips/${tripId}/schedule/new?day=${dayNumber}&lat=${trip.center.lat}&lng=${trip.center.lng}`
                      )
                    }
                  >
                    추가
                  </button>
                </div>

                {daySchedules.length > 0 && (
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={daySchedules.map((schedule: any) => schedule.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="schedule-list">
                        {daySchedules.map(
                          (schedule: any, scheduleIndex: number) => (
                            <SortableScheduleItem
                              key={schedule.id}
                              schedule={schedule}
                              scheduleIndex={scheduleIndex}
                              onDelete={handleDeleteSchedule}
                            />
                          )
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            );
          })}
        </section>

        <nav className="bottom-tab">
          <button className="active-tab">일정</button>
          <button onClick={() => navigate(`/trips/${tripId}/budget`)}>
            예산
          </button>
          <button onClick={() => navigate(`/trips/${tripId}/friends`)}>
            친구
          </button>
          <button>리포트</button>
        </nav>
      </div>
    </div>
  );
}