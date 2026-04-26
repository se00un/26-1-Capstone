import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./BudgetPage.css";

const createTripDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const days = [];
  const current = new Date(start);
  let index = 1;

  while (current <= end) {
    days.push({
      day: `${index}일차`,
      date: `${current.getMonth() + 1}월 ${current.getDate()}일`,
      dayNumber: index,
    });

    current.setDate(current.getDate() + 1);
    index++;
  }

  return days;
};

export default function BudgetPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [isSettingOpen, setIsSettingOpen] = useState(false);

  const savedTrips = JSON.parse(localStorage.getItem("trips") || "[]");
  const savedTrip = savedTrips.find(
    (trip: any) => String(trip.id) === String(tripId)
  );

  if (!savedTrip) {
    return (
      <div className="app-container">
        <div className="budget-page">
          <button className="back-btn" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h1>존재하지 않는 여행입니다.</h1>
        </div>
      </div>
    );
  }

  const days = createTripDays(savedTrip.startDate, savedTrip.endDate);

  const savedSchedules = JSON.parse(
    localStorage.getItem(`schedule-${tripId}`) || "[]"
  );

  return (
    <div className="app-container">
      <div className="budget-page">
        <header className="budget-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h1>예산</h1>
        </header>

        <button
          className="budget-setting-btn"
          onClick={() => setIsSettingOpen(true)}
        >
          예산 설정하기
        </button>

        <section className="budget-days">
          {days.map((day) => {
            const daySchedules = savedSchedules.filter(
              (schedule: any) => String(schedule.day) === String(day.dayNumber)
            );

            return (
              <div className="budget-day-card" key={day.day}>
                <div className="budget-day-header">
                  <div>
                    <strong>{day.day}</strong>
                    <span>{day.date}</span>
                  </div>

                  <button className="budget-add-btn">추가</button>
                </div>

                {daySchedules.length > 0 && (
                  <div className="budget-schedule-list">
                    {daySchedules.map((schedule: any) => (
                      <div className="budget-schedule-item" key={schedule.id}>
                        <span>{schedule.place}</span>
                        <small>{schedule.memo}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {isSettingOpen && (
          <div className="budget-modal-backdrop">
            <div className="budget-modal">
              <button
                className="budget-modal-close"
                onClick={() => setIsSettingOpen(false)}
              >
                ✕
              </button>

              <h2>예산 설정</h2>

              <BudgetInput label="총 예산" />
              <BudgetInput label="교통" />
              <BudgetInput label="숙소" />
              <BudgetInput label="음식" />
              <BudgetInput label="관광" />
              <BudgetInput label="쇼핑" />
              <BudgetInput label="기타" />

              <button
                className="budget-complete-btn"
                onClick={() => setIsSettingOpen(false)}
              >
                설정 완료
              </button>
            </div>
          </div>
        )}

        <nav className="bottom-tab">
          <button onClick={() => navigate(`/trips/${tripId}`)}>일정</button>
          <button className="active-tab">예산</button>
          <button onClick={() => navigate(`/trips/${tripId}/friends`)}>
            친구
          </button>
          <button>리포트</button>
        </nav>
      </div>
    </div>
  );
}

function BudgetInput({ label }: { label: string }) {
  return (
    <div className="budget-input-row">
      <label>{label}</label>
      <input type="number" />
    </div>
  );
}