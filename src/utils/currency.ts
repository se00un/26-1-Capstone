// 통화 유틸 — 하드코딩 없이 전부 API/브라우저 내장 기능 사용
// 1) KRW → 외화 환율: jsdelivr 환율 CDN (백엔드 exchange_service.py와 동일 소스)
// 2) 기호/소수점/한글이름: Intl (브라우저 내장)

// KRW 기준 전체 환율 테이블 ({ jpy: 0.106, usd: 0.00072, ... }) — 세션 내 1회만 fetch
let krwTablePromise: Promise<Record<string, number> | null> | null = null;

export const getKrwRateTable = (): Promise<Record<string, number> | null> => {
  if (!krwTablePromise) {
    krwTablePromise = fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.json"
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.krw ?? null)
      .catch(() => null);
  }
  return krwTablePromise;
};

// KRW → 대상 통화 환율 (최신). 실패 시 null (호출부에서 KRW 표시 유지)
export const fetchKrwRate = async (
  currency: string
): Promise<number | null> => {
  if (currency === "KRW") return 1;
  const table = await getKrwRateTable();
  const rate = table?.[currency.toLowerCase()];
  return typeof rate === "number" && rate > 0 ? rate : null;
};

// 원화 금액 계산 공통 로직. 기본은 백엔드가 저장한 환산값(krw)을 쓰되,
// 외화인데 krw == 원금액이면 백엔드 환율 fallback(1.0)으로 잘못 저장된
// 것이므로 (실제 1.0인 통화는 없음) 환율 테이블로 재환산
export const toKrwAmount = (
  orig: number,
  krw: number,
  currency: string,
  table: Record<string, number> | null
): number => {
  const cur = String(currency || "KRW").toUpperCase();
  if (cur === "KRW") return krw || orig;
  if (krw !== orig) return krw; // 정상 환산된 값

  const rate = table?.[cur.toLowerCase()]; // KRW→통화 환율
  return rate && rate > 0 ? Math.round(orig / rate) : krw;
};

// 지출의 원화 금액 (fallback 오염 보정 포함)
export const expenseToKrw = (
  e: any,
  table: Record<string, number> | null
): number => {
  const orig = Number(e?.amount_original ?? 0);
  return toKrwAmount(orig, Number(e?.amount_krw ?? orig), e?.currency, table);
};

// 예산 항목의 원화 금액 (fallback 오염 보정 포함)
export const budgetToKrw = (
  b: any,
  table: Record<string, number> | null
): number => {
  const orig = Number(b?.amount ?? 0);
  return toKrwAmount(orig, Number(b?.amount_krw ?? orig), b?.currency, table);
};

// 통화 코드 → 좁은 기호: "JPY" → "¥", "USD" → "$", "KRW" → "₩"
export const currencySymbol = (currency: string): string => {
  try {
    const parts = new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
};

// 금액 뒤에 통화 기호: (1234, "JPY") → "1,234¥" / (12000, "KRW") → "12,000₩"
// 기호·소수점 자릿수는 Intl에서 가져오고 순서만 숫자→기호로 재배치
export const formatAmountWithSymbol = (
  n: number,
  currency: string
): string => {
  try {
    const parts = new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol", // "JP¥" 대신 "¥"
    }).formatToParts(n);
    const symbol =
      parts.find((p) => p.type === "currency")?.value ?? currency;
    const number = parts
      .filter((p) => p.type !== "currency" && p.type !== "literal")
      .map((p) => p.value)
      .join("");
    return `${number}${symbol}`;
  } catch {
    return `${n.toLocaleString("ko-KR")} ${currency}`;
  }
};
