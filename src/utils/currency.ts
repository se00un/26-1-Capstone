// 통화 유틸 — 하드코딩 없이 전부 API/브라우저 내장 기능 사용
// 1) 국가명 → 통화코드: REST Countries API (한국어/영어 국가명 지원, 무료/키 불필요)
// 2) KRW → 외화 환율: jsdelivr 환율 CDN (백엔드 exchange_service.py와 동일 소스)
// 3) 기호/소수점 포맷: Intl.NumberFormat (브라우저 내장)

const COUNTRY_CACHE_KEY = "countryCurrencyCache";

// 국가명(자유 텍스트, 한국어 가능) → 통화 코드. 실패 시 "KRW"
// 같은 국가명 재조회 방지를 위해 localStorage에 캐시
export const getCurrencyForCountry = async (
  country: string | null | undefined
): Promise<string> => {
  if (!country?.trim()) return "KRW";
  const key = country.trim();

  const cache: Record<string, string> = JSON.parse(
    localStorage.getItem(COUNTRY_CACHE_KEY) ?? "{}"
  );
  if (cache[key]) return cache[key];

  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/translation/${encodeURIComponent(
        key
      )}?fields=name,currencies`
    );
    if (!res.ok) return "KRW";
    const list = await res.json();
    const currencies = Array.isArray(list) ? list[0]?.currencies : null;
    const code = currencies ? Object.keys(currencies)[0] : null;
    if (!code) return "KRW";

    cache[key] = code;
    localStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(cache));
    return code;
  } catch {
    return "KRW";
  }
};

// KRW → 대상 통화 환율 (최신). 실패 시 null (호출부에서 KRW 표시 유지)
export const fetchKrwRate = async (
  currency: string
): Promise<number | null> => {
  if (currency === "KRW") return 1;
  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.json"
    );
    if (!res.ok) return null;
    const data = await res.json();
    const rate = data?.krw?.[currency.toLowerCase()];
    return typeof rate === "number" && rate > 0 ? rate : null;
  } catch {
    return null;
  }
};

// 통화 표시: (1234.5, "USD") → "US$1,234.50" / (1234, "JPY") → "JP¥1,234"
// 기호·소수점 자릿수는 Intl이 통화별로 알아서 처리
export const formatCurrency = (n: number, currency: string): string => {
  try {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString("ko-KR")}`;
  }
};
