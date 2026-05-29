import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createExpense } from "../api/expenseAPI";
import { CATEGORIES } from "../constants/categories";
import { digitsOnly, formatNumberInput } from "../utils/money";
import "./AddExpensePage.css";

export default function AddExpensePage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();

  const day = searchParams.get("day") ?? "1";
  const date = searchParams.get("date") ?? ""; // YYYY-MM-DD

  const dateLabel = date
    ? `${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일`
    : "";

  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState<"personal" | "shared">("personal");
  const [category, setCategory] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!tripId) return;
    if (!title.trim()) {
      alert("내역을 입력해주세요.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("금액을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      await createExpense(tripId, {
        title: title.trim(),
        amount_original: Number(amount),
        expense_date: date,
        expense_type: scope,
        category: category || undefined,
        memo: memo || undefined,
      });
      navigate(`/trips/${tripId}/budget`);
    } catch (error) {
      console.error("지출 추가 실패:", error);
      alert("지출 추가에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <div className="add-expense-page">
        <header className="add-expense-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h1>지출 추가</h1>
          <button
            className="receipt-link"
            onClick={() => navigate(`/trips/${tripId}/budget/receipt?day=${day}&date=${date}`)}
          >
            📷
            <span>영수증 인식</span>
          </button>
        </header>

        <div className="add-expense-day">
          <strong>{day}일차</strong>
          <span>{dateLabel}</span>
        </div>

        <div className="form-group">
          <label>금액</label>
          <input
            type="text"
            inputMode="numeric"
            value={formatNumberInput(amount)}
            onChange={(e) => setAmount(digitsOnly(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>내역</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>범위</label>
          <div className="scope-toggle">
            <button
              className={`scope-btn ${scope === "personal" ? "active personal" : ""}`}
              onClick={() => setScope("personal")}
            >
              개인
            </button>
            <button
              className={`scope-btn ${scope === "shared" ? "active shared" : ""}`}
              onClick={() => setScope("shared")}
            >
              공동
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>카테고리</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">선택</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.icon} {c.key}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>메모</label>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>

        <button className="primary-btn" onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
