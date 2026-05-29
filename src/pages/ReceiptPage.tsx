import { useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  uploadReceipt,
  getReceiptDetail,
  confirmReceipt,
} from "../api/receiptAPI";
import { CATEGORIES } from "../constants/categories";
import { digitsOnly, formatNumberInput } from "../utils/money";
import "./AddExpensePage.css";
import "./ReceiptPage.css";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const POLL_INTERVAL = 2000;
const POLL_MAX = 20; // 최대 약 40초 대기

export default function ReceiptPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const day = searchParams.get("day") ?? "1";
  const dateParam = searchParams.get("date") ?? "";

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [phase, setPhase] = useState<"upload" | "processing" | "review">(
    "upload"
  );
  const [receiptId, setReceiptId] = useState<number | null>(null);

  // 검수(프리필) 폼
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KRW");
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState<"personal" | "shared">("personal");
  const [category, setCategory] = useState("");
  const [memo, setMemo] = useState("");
  const [expenseDate, setExpenseDate] = useState(dateParam);
  const [saving, setSaving] = useState(false);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleRecognize = async () => {
    if (!tripId || !file) {
      alert("영수증 이미지를 선택해주세요.");
      return;
    }
    setPhase("processing");
    try {
      const uploaded = await uploadReceipt(tripId, file);
      const rid = uploaded.id;
      setReceiptId(rid);

      // OCR 완료까지 폴링
      let parsed: any = null;
      for (let i = 0; i < POLL_MAX; i++) {
        await sleep(POLL_INTERVAL);
        const detail = await getReceiptDetail(rid);
        const pj = detail?.parsed_json;
        if (pj?.error) throw new Error(pj.error);
        if (detail?.status === "completed" && pj) {
          parsed = pj;
          break;
        }
      }
      if (!parsed) throw new Error("OCR 시간 초과");

      // 프리필 (상호/title은 OCR이 안 줌 → 사용자 입력)
      if (parsed.amount_original != null)
        setAmount(String(parsed.amount_original));
      if (parsed.currency) setCurrency(parsed.currency);
      if (parsed.expense_date) setExpenseDate(parsed.expense_date);
      if (parsed.category) setCategory(parsed.category);
      setPhase("review");
    } catch (error) {
      console.error("영수증 인식 실패:", error);
      alert(
        "영수증 인식에 실패했어요. 직접 입력 화면으로 이동합니다."
      );
      navigate(
        `/trips/${tripId}/budget/expense/new?day=${day}&date=${dateParam}`
      );
    }
  };

  const handleConfirm = async () => {
    if (!receiptId) return;
    if (!title.trim()) {
      alert("내역을 입력해주세요.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("금액을 확인해주세요.");
      return;
    }
    try {
      setSaving(true);
      await confirmReceipt(receiptId, {
        title: title.trim(),
        amount_original: Number(amount),
        expense_date: expenseDate,
        currency: currency || "KRW",
        expense_type: scope,
        category: category || undefined,
        memo: memo || undefined,
      });
      navigate(`/trips/${tripId}/budget`);
    } catch (error) {
      console.error("지출 확정 실패:", error);
      alert("지출 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // --- 검수(프리필) 화면 ---
  if (phase === "review") {
    return (
      <div className="app-container">
        <div className="add-expense-page">
          <header className="add-expense-header">
            <button className="back-btn" onClick={() => setPhase("upload")}>
              &lt;
            </button>
            <h1>영수증 인식</h1>
          </header>

          {previewUrl && (
            <img className="receipt-review-img" src={previewUrl} alt="영수증" />
          )}

          <div className="form-group">
            <label>금액</label>
            <div className="receipt-amount-row">
              <input
                type="text"
                inputMode="numeric"
                value={formatNumberInput(amount)}
                onChange={(e) => setAmount(digitsOnly(e.target.value))}
              />
              <input
                className="receipt-currency"
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>내역</label>
            <input
              type="text"
              placeholder="상호/내용을 입력하세요"
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
          </div>

          <button
            className="primary-btn"
            onClick={handleConfirm}
            disabled={saving}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    );
  }

  // --- 업로드 / 인식 중 화면 ---
  return (
    <div className="app-container">
      <div className="receipt-page">
        <header className="receipt-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h1>영수증 인식</h1>
        </header>

        <button
          type="button"
          className="receipt-dropzone"
          onClick={() => phase === "upload" && fileRef.current?.click()}
          disabled={phase === "processing"}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="영수증 미리보기" />
          ) : (
            <span className="receipt-placeholder">＋ 이미지 업로드</span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png"
            hidden
            onChange={handlePick}
          />
        </button>

        <p className="receipt-guide">
          영수증 전체가 잘 보이도록 해주세요.
          <br />
          (글씨가 잘 안 보일 경우 인식이 불가능할 수 있습니다.
          <br />
          그럴 경우 직접 추가해 주세요.)
        </p>

        <button
          className="receipt-recognize-btn"
          onClick={handleRecognize}
          disabled={phase === "processing"}
        >
          {phase === "processing" ? "인식 중..." : "인식하기"}
        </button>

        <button
          className="receipt-manual-link"
          onClick={() =>
            navigate(
              `/trips/${tripId}/budget/expense/new?day=${day}&date=${dateParam}`
            )
          }
        >
          직접 입력하기
        </button>
      </div>
    </div>
  );
}
