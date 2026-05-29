import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExpenses, updateExpense, deleteExpense } from "../api/expenseAPI";
import { CATEGORIES } from "../constants/categories";
import "./AddExpensePage.css";
import "./ExpenseDetailPage.css";

const getMyId = (): number | null => {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.id ?? null;
  } catch {
    return null;
  }
};

export default function ExpenseDetailPage() {
  const navigate = useNavigate();
  const { tripId, expenseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [createdBy, setCreatedBy] = useState<number | null>(null);
  const [expenseDate, setExpenseDate] = useState("");

  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState<"personal" | "shared">("personal");
  const [category, setCategory] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!tripId || !expenseId) return;
      try {
        const list = await getExpenses(tripId);
        const found = (Array.isArray(list) ? list : []).find(
          (e: any) => String(e.id) === String(expenseId)
        );
        if (!found) {
          setNotFound(true);
          return;
        }
        setCreatedBy(found.created_by ?? null);
        setExpenseDate(String(found.expense_date).slice(0, 10));
        setAmount(String(Math.round(Number(found.amount_original ?? 0))));
        setTitle(found.title ?? "");
        setScope(found.expense_type === "shared" ? "shared" : "personal");
        setCategory(found.category ?? "");
        setMemo(found.memo ?? "");
      } catch (error) {
        console.error("지출 상세 조회 실패:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tripId, expenseId]);

  const isOwner = createdBy != null && createdBy === getMyId();

  const handleSave = async () => {
    if (!expenseId) return;
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
      await updateExpense(expenseId, {
        title: title.trim(),
        amount_original: Number(amount),
        expense_type: scope,
        category: category || undefined,
        memo: memo || undefined,
      });
      navigate(`/trips/${tripId}/budget`);
    } catch (error) {
      console.error("지출 수정 실패:", error);
      alert("지출 수정에 실패했습니다. (본인이 추가한 내역만 수정할 수 있어요)");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!expenseId) return;
    if (!window.confirm("이 지출 내역을 삭제하시겠습니까?")) return;
    try {
      setSaving(true);
      await deleteExpense(expenseId);
      navigate(`/trips/${tripId}/budget`);
    } catch (error) {
      console.error("지출 삭제 실패:", error);
      alert("지출 삭제에 실패했습니다. (본인이 추가한 내역만 삭제할 수 있어요)");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="add-expense-page">
          <h1>불러오는 중...</h1>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="app-container">
        <div className="add-expense-page">
          <button className="back-btn" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h1>존재하지 않는 지출입니다.</h1>
        </div>
      </div>
    );
  }

  const dateLabel = expenseDate
    ? `${Number(expenseDate.slice(5, 7))}월 ${Number(expenseDate.slice(8, 10))}일`
    : "";

  return (
    <div className="app-container">
      <div className="add-expense-page">
        <header className="add-expense-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h1>지출 상세</h1>
        </header>

        <div className="add-expense-day">
          <span>{dateLabel}</span>
        </div>

        {!isOwner && (
          <p className="expense-readonly-note">
            본인이 추가한 내역만 수정·삭제할 수 있습니다.
          </p>
        )}

        <div className="form-group">
          <label>금액</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isOwner}
          />
        </div>

        <div className="form-group">
          <label>내역</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isOwner}
          />
        </div>

        <div className="form-group">
          <label>범위</label>
          <div className="scope-toggle">
            <button
              className={`scope-btn ${scope === "personal" ? "active personal" : ""}`}
              onClick={() => isOwner && setScope("personal")}
              disabled={!isOwner}
            >
              개인
            </button>
            <button
              className={`scope-btn ${scope === "shared" ? "active shared" : ""}`}
              onClick={() => isOwner && setScope("shared")}
              disabled={!isOwner}
            >
              공동
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={!isOwner}
          >
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
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={!isOwner}
          />
        </div>

        {isOwner && (
          <div className="expense-detail-actions">
            <button className="primary-btn" onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : "수정 저장"}
            </button>
            <button
              className="expense-delete-btn"
              onClick={handleDelete}
              disabled={saving}
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
