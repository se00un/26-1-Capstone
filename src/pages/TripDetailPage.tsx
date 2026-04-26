import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import RouteMap from "../components/RouteMap";
import SortableScheduleItem from "../components/SortableScheduleItem";
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

  const savedTrips = JSON.parse(localStorage.getItem("trips") || "[]");

  const savedTrip = savedTrips.find(
    (trip: any) => String(trip.id) === String(tripId)
  );

  const trip =
    savedTrip && {
      title: savedTrip.title,
      date: savedTrip.date.replace("~", "-"),
      center: {
        lat: savedTrip.lat,
        lng: savedTrip.lng,
      },
      places: [],
      days: createTripDays(savedTrip.startDate, savedTrip.endDate),
    };

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

  const [savedSchedules, setSavedSchedules] = useState<any[]>(() =>
    JSON.parse(localStorage.getItem(`schedule-${tripId}`) || "[]")
  );

  const schedulePlaces = savedSchedules.map((schedule: any) => ({
    id: schedule.id,
    name: schedule.place,
    lat: schedule.lat,
    lng: schedule.lng,
  }));

  const handleDeleteSchedule = (scheduleId: number) => {
    const key = `schedule-${tripId}`;

    const updated = savedSchedules.filter(
      (item: any) => item.id !== scheduleId
    );

    setSavedSchedules(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItem = savedSchedules.find(
      (item: any) => item.id === active.id
    );
    const overItem = savedSchedules.find(
      (item: any) => item.id === over.id
    );

    // 다른 day면 이동 금지
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
    localStorage.setItem(`schedule-${tripId}`, JSON.stringify(updated));
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
          {trip.days.map((item: { day: string; date: string }, index: number) => {
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
                      navigate(
                        `/trips/${tripId}/schedule/new?day=${index + 1}&lat=${trip.center.lat}&lng=${trip.center.lng}`
                      )
                    }
                  >
                    추가
                  </button>
                </div>

                {daySchedules.length > 0 && (
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={daySchedules.map((schedule: any) => schedule.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="schedule-list">
                        {daySchedules.map((schedule: any, scheduleIndex: number) => (
                          <SortableScheduleItem
                            key={schedule.id}
                            schedule={schedule}
                            scheduleIndex={scheduleIndex}
                            onDelete={handleDeleteSchedule}
                          />
                        ))}
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