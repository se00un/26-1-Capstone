import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "../constants/categories";
import "./CategorySelect.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

// 네이티브 select는 드롭다운 폰트/위치를 제어할 수 없어서 커스텀으로 구현
export default function CategorySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  // 메뉴가 화면(스크롤 영역) 아래로 뚫고 나가면 보이도록 자동 스크롤
  useEffect(() => {
    if (open) {
      menuRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [open]);

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

  const selected = CATEGORIES.find((c) => c.key === value);

  const pick = (key: string) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div className="category-select" ref={rootRef}>
      <button
        type="button"
        className="category-select-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected ? "" : "placeholder"}>
          {selected ? `${selected.icon} ${selected.key}` : "선택"}
        </span>
        <span className={`chevron ${open ? "up" : ""}`}>▾</span>
      </button>

      {open && (
        <ul className="category-select-menu" ref={menuRef}>
          <li>
            <button
              type="button"
              className={`muted ${value === "" ? "active" : ""}`}
              onClick={() => pick("")}
            >
              선택 안 함
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                className={c.key === value ? "active" : ""}
                onClick={() => pick(c.key)}
              >
                {c.icon} {c.key}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
