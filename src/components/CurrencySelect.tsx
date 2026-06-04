import { useEffect, useMemo, useRef, useState } from "react";
import { currencySymbol } from "../utils/currency";
import "./CurrencySelect.css";

type Props = {
  value: string;
  onChange: (code: string) => void;
};

// 통화 목록/한글 이름은 전부 브라우저 내장 Intl에서 — 하드코딩 없음
const CURRENCY_CODES: string[] = Intl.supportedValuesOf("currency");
const KO_NAME = new Intl.DisplayNames(["ko"], { type: "currency" });

// 검색 가능한 통화 선택 드롭다운 (예산 화면 상단)
export default function CurrencySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  // 열리면 검색창에 바로 포커스
  useEffect(() => {
    if (open) {
      setQuery("");
      searchRef.current?.focus();
    }
  }, [open]);

  const items = useMemo(
    () =>
      CURRENCY_CODES.map((code) => ({
        code,
        name: KO_NAME.of(code) ?? code,
        symbol: currencySymbol(code),
      })),
    []
  );

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter(
        (it) =>
          it.code.toLowerCase().includes(q) ||
          it.name.toLowerCase().includes(q) ||
          it.symbol.toLowerCase() === q
      )
    : items;

  const selected = items.find((it) => it.code === value);

  const pick = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <div className="currency-select" ref={rootRef}>
      <button
        type="button"
        className="currency-select-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="currency-symbol">{selected?.symbol ?? value}</span>
        <span className="currency-code">{value}</span>
        <span className={`chevron ${open ? "up" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="currency-select-menu">
          <div className="currency-search">
            <span className="currency-search-icon">🔍</span>
            <input
              ref={searchRef}
              type="text"
              placeholder="통화 검색 (엔, JPY...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <ul className="currency-list">
            {filtered.map((it) => (
              <li key={it.code}>
                <button
                  type="button"
                  className={it.code === value ? "active" : ""}
                  onClick={() => pick(it.code)}
                >
                  <span className="currency-symbol">{it.symbol}</span>
                  <span className="currency-code">{it.code}</span>
                  <span className="currency-name">{it.name}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="currency-empty">검색 결과 없음</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
