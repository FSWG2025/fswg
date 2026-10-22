/**
 * General helper utilities
 */

/**
 * Generate a random string of specified length
 * @param length - Length of the random string (default: 20)
 * @returns Random alphanumeric string
 */
export const generateRandomString = (length: number = 20): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a slug from a string
 * @param text - Input text
 * @returns URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, ""); // Trim hyphens from end
};

/**
 * Format currency for display
 * @param amount - Number to format
 * @param currency - Currency code (default: CAD)
 * @param locale - Locale string (default: en-CA)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = "CAD",
  locale: string = "en-CA"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date for display
 * @param date - Date object or string
 * @param format - Format style
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  format: "short" | "long" | "full" = "long"
): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: format === "short" ? "short" : "long",
    day: "numeric",
  };

  if (format === "full") {
    options.weekday = "long";
  }

  return d.toLocaleDateString("en-CA", options);
};

/**
 * Format time for display
 * @param date - Date object or string
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Truncate text with ellipsis
 * @param text - Input text
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

/**
 * Sanitize string (remove HTML tags)
 * @param input - Input string
 * @returns Sanitized string
 */
export const sanitizeString = (input: string): string => {
  return input.replace(/<[^>]*>/g, "").trim();
};

/**
 * Capitalize first letter of string
 * @param str - Input string
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert enum values to human-readable labels
 * @param value - Enum value
 * @returns Formatted label
 */
export const formatEnumValue = (value: string): string => {
  return value
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
};

/**
 * Get pagination metadata
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata
 */
export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
};

/**
 * Build query filter from request query params
 * @param query - Express request query object
 * @param allowedFields - Array of allowed field names
 * @returns Filter object for MongoDB queries
 */
export const buildFilter = (
  query: any,
  allowedFields: string[]
): Record<string, any> => {
  const filter: Record<string, any> = {};

  for (const field of allowedFields) {
    if (query[field] !== undefined && query[field] !== "") {
      filter[field] = query[field];
    }
  }

  return filter;
};

/**
 * Parse boolean string to boolean
 * @param value - String value
 * @returns Boolean or undefined
 */
export const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

/**
 * Convert string to number safely
 * @param value - String value
 * @param defaultValue - Default value if parsing fails
 * @returns Number
 */
export const parseNumber = (
  value: string | undefined,
  defaultValue: number = 0
): number => {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
};