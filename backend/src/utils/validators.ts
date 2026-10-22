/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Canadian format)
 * Accepts: +1 (123) 456-7890, 123-456-7890, 1234567890
 */
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  const phoneRegex = /^(\+1)?\d{10}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): {
  valid: boolean;
  message: string;
  strength: "weak" | "medium" | "strong";
} => {
  if (!password || password.length < 6) {
    return {
      valid: false,
      message: "Password must be at least 6 characters",
      strength: "weak",
    };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  let strength: "weak" | "medium" | "strong" = "weak";
  if (score >= 4) strength = "medium";
  if (score >= 6) strength = "strong";

  return {
    valid: true,
    message: `Password strength: ${strength}`,
    strength,
  };
};

/**
 * Validate MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate Canadian postal code
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  const postalRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
  return postalRegex.test(postalCode);
};

/**
 * Validate date string
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate number is within range
 */
export const isInRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate required fields in an object
 * @returns Array of missing field names
 */
export const getMissingFields = (
  data: Record<string, any>,
  requiredFields: string[]
): string[] => {
  return requiredFields.filter(
    (field) =>
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ""
  );
};

/**
 * Validate string length
 */
export const isValidLength = (
  str: string,
  min: number,
  max: number
): boolean => {
  return str.length >= min && str.length <= max;
};