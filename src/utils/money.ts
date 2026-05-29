// 돈 관련 숫자 공용 포맷 (천단위 콤마: 000,000)

// 표시용: 숫자 → "1,234,000"
export const formatMoney = (n: number | string): string => {
  const num =
    typeof n === "string" ? Number(n.replace(/[^0-9.-]/g, "")) : n;
  if (!Number.isFinite(num)) return "0";
  return Math.round(num).toLocaleString("ko-KR");
};

// 입력창에서 숫자만 추출 ("1,234원" → "1234")
export const digitsOnly = (s: string): string => s.replace(/[^0-9]/g, "");

// 입력창 표시용: 입력 문자열 → 콤마 적용 ("1234" → "1,234", "" → "")
export const formatNumberInput = (s: string): string => {
  const d = digitsOnly(s);
  return d ? Number(d).toLocaleString("ko-KR") : "";
};
