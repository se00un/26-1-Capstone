import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyTrips } from "../api/tripAPI";
import { getExpenses } from "../api/expenseAPI";
import { CATEGORY_ICON } from "../constants/categories";
import "./BudgetPage.css";

type TripDay = {
  dayNumber: number;
  label: string;
  date: string;
  iso: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

const createTripDays = (startDate: string, endDate: string): TripDay[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: TripDay[] = [];
  const current = new Date(start);
  let index = 1;

  while (current <= end) {
    days.push({
      dayNumber: index,
      label: `${index}일차`,
      date: `${current.getMonth() + 1}월 ${current.getDate()}일`,
      iso: `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(
        current.getDate()
      )}`,
    });
    current.setDate(current.getDate() + 1);
    index++;
  }
  return days;
};

const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function BudgetPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [trip, setTrip] = useState<any>(null);
  const [days, setDays] = useState<TripDay[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!tripId) return;
    try {
      const trips = await getMyTrips();
      const found = trips.find((t: any) => String(t.id) === String(tripId));
      setTrip(found ?? null);
      if (found) {
        setDays(createTripDays(found.start_date, found.end_date));
      }

      const expenseList = await getExpenses(tripId);
      setExpenses(Array.isArray(expenseList) ? expenseList : []);
    } catch (error) {
      console.error("예산 화면 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tripId]);

  const expensesByDay = (iso: string) =>
    expenses.filter((e) => String(e.expense_date).slice(0, 10) === iso);

  if (loading) {
    return (
      <div className="app-container">
        <div className="budget-page">
          <h1>불러오는 중...</h1>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="app-container">
        <div className="budget-page">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ✕
          </button>
          <h1>존재하지 않는 여행입니다.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="budget-page">
        <header className="budget-top">
          <button
            className="back-btn"
            onClick={() => navigate(`/trips/${tripId}`)}
          >
            ✕
          </button>
          <h1 className="budget-trip-title">{trip.title}</h1>

          <div className="budget-top-actions">
            <button
              className="settle-btn"
              onClick={() => navigate(`/trips/${tripId}/settle`)}
            >
              정산하기
            </button>
            <button
              className="manage-btn"
              onClick={() => navigate(`/trips/${tripId}/budget/manage`)}
            >
              예산 관리
            </button>
          </div>
        </header>

        <section className="budget-days">
          {days.map((day) => {
            const dayExpenses = expensesByDay(day.iso);

            return (
              <div className="budget-day-card" key={day.dayNumber}>
                <div className="budget-day-header">
                  <div>
                    <strong>{day.label}</strong>
                    <span>{day.date}</span>
                  </div>

                  <div className="budget-day-tools">
                    <span className="reorder-icon">⇅</span>
                    <button
                      className="budget-add-btn"
                      onClick={() =>
                        navigate(
                          `/trips/${tripId}/budget/expense/new?day=${day.dayNumber}&date=${day.iso}`
                        )
                      }
                    >
                      추가
                    </button>
                  </div>
                </div>

                {dayExpenses.length > 0 && (
                  <div className="budget-expense-list">
                    {dayExpenses.map((e, idx) => (
                      <button
                        type="button"
                        className="budget-expense-item"
                        key={e.id}
                        onClick={() =>
                          navigate(
                            `/trips/${tripId}/budget/expense/${e.id}`
                          )
                        }
                      >
                        <span
                          className={`expense-badge ${
                            e.expense_type === "shared" ? "shared" : "personal"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="expense-title">
                          {e.title} {CATEGORY_ICON[e.category] ?? ""}
                        </span>
                        <span className="expense-right">
                          <span className="expense-amount">
                            -{won(Number(e.amount_krw ?? e.amount_original ?? 0))}
                          </span>
                          {e.memo && (
                            <span className="expense-memo">{e.memo}</span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

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
