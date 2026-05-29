import { useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./ReceiptPage.css";

// 영수증 인식 화면 (틀)
// TODO(api): 실제 OCR 연동
//   1) POST /api/receipts/{tripId}/upload  (multipart, file) → receipt_id (202)
//   2) GET  /api/receipts/{receiptId}/detail → parsed_json (금액/내역/카테고리 등)
//   3) 인식 결과로 지출 폼 프리필 → POST /api/receipts/{receiptId}/confirm-receipt
// 현재는 이미지 선택/미리보기 + '인식하기' 버튼 골격만 제공.
export default function ReceiptPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const day = searchParams.get("day") ?? "1";
  const date = searchParams.get("date") ?? "";

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRecognize = () => {
    // TODO(api): 업로드 → OCR → 결과 프리필 후 지출 추가 폼으로 이동
    alert("영수증 인식 API 연동 예정입니다. (현재는 화면 틀)");
  };

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
          onClick={() => fileRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="영수증 미리보기" />
          ) : (
            <span className="receipt-placeholder">＋ 이미지 업로드</span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
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

        <button className="receipt-recognize-btn" onClick={handleRecognize}>
          인식하기
        </button>

        <button
          className="receipt-manual-link"
          onClick={() =>
            navigate(
              `/trips/${tripId}/budget/expense/new?day=${day}&date=${date}`
            )
          }
        >
          직접 입력하기
        </button>
      </div>
    </div>
  );
}
