// 예산/지출 공용 카테고리 (디자인상 고정 6종)
export const CATEGORIES = [
  { key: "교통", icon: "✈️" },
  { key: "숙소", icon: "🏠" },
  { key: "음식", icon: "🍽️" },
  { key: "관광", icon: "📷" },
  { key: "쇼핑", icon: "🛍️" },
  { key: "기타", icon: "💬" },
] as const;

export const CATEGORY_ICON: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.icon])
);

// 카테고리 사용률이 이 값(%) 이상이면 위험(빨강)으로 표시
export const CATEGORY_DANGER_THRESHOLD = 80;
