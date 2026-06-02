// Auth
export const MIN_PASSWORD_LENGTH = 8;
export const AUTH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Validation
export const MAX_CATEGORY_NAME_LENGTH = 100;
export const MIN_AMOUNT_STEP = 0.01;

// TanStack Query
export const QUERY_STALE_TIME_MS = 30_000;

// Analytics date-range bucketing thresholds (inclusive day count)
export const ANALYTICS_DAY_BUCKET_MAX_DAYS = 31;
export const ANALYTICS_WEEK_BUCKET_MAX_DAYS = 180;

// localStorage keys
export const STORAGE_KEYS = {
  CATEGORY_COLORS: 'niffler_category_colors',
  COLUMN_PREFERENCES: 'niffler_column_prefs',
} as const;
