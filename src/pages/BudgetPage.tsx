import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyTrips } from "../api/tripAPI";
import { getExpenses } from "../api/expenseAPI";
import { CATEGORY_ICON } from "../constants/categories";
import { formatMoney } from "../utils/money";
import {
  getCurrencyForCountry,
  fetchKrwRate,
  formatCurrency,
} from "../utils/currency";
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

export default function BudgetPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [trip, setTrip] = useState<any>(null);
  const [days, setDays] = useState<TripDay[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 여행 국가의 현지 통화 + KRW→현지 환율 (조회 실패 시 KRW 표시 유지)
  const [localCurrency, setLocalCurrency] = useState("KRW");
  const [krwRate, setKrwRate] = useState<number | null>(null);

  const load = async () => {
    if (!tripId) return;
    try {
      const trips = await getMyTrips();
      const found = trips.find((t: any) => String(t.id) === String(tripId));
      setTrip(found ?? null);
      if (found) {
        setDays(createTripDays(found.start_date, found.end_date));

        // 국가명 → 통화 → 환율 (실패해도 화면은 KRW로 정상 동작)
        const currency = await getCurrencyForCountry(found.country);
        if (currency !== "KRW") {
          const rate = await fetchKrwRate(currency);
          if (rate) {
            setLocalCurrency(currency);
            setKrwRate(rate);
          }
        }
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

  // 지출 금액을 현지 통화로 표시.
  // 원래 현지 통화로 쓴 지출이면 원금액 그대로(정확), KRW 등 다른 통화면 환율로 환산
  const displayAmount = (e: any): string => {
    const krw = Number(e.amount_krw ?? e.amount_original ?? 0);
    if (localCurrency === "KRW" || !krwRate) return formatMoney(krw);
    if (e.currency === localCurrency) {
      return formatCurrency(Number(e.amount_original ?? 0), localCurrency);
    }
    return formatCurrency(krw * krwRate, localCurrency);
  };

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
                            -{displayAmount(e)}
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
