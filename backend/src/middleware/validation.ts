import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "./errorHandler";

// @desc    Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Validate phone number (Canadian format)
export const validatePhone = (phone: string): boolean => {
  // Accepts: +1 (123) 456-7890, 123-456-7890, 1234567890
  const phoneRegex = /^(\+1[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// @desc    Validate password strength
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }

  if (password.length > 128) {
    return { valid: false, message: "Password must be less than 128 characters" };
  }

  // Optional: Require complexity
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumbers = /\d/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
  //   return {
  //     valid: false,
  //     message: "Password must contain uppercase, lowercase, number, and special character",
  //   };
  // }

  return { valid: true, message: "Password is valid" };
};

// @desc    Validate MongoDB ObjectId
export const isValidObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// @desc    Validate date string
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// @desc    Validate URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// @desc    Validate Canadian postal code
export const validatePostalCode = (postalCode: string): boolean => {
  const postalRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
  return postalRegex.test(postalCode);
};

// @desc    Validate SIN (Social Insurance Number)
export const validateSIN = (sin: string): boolean => {
  const sinRegex = /^\d{9}$/;
  if (!sinRegex.test(sin.replace(/\s/g, ""))) return false;

  // Luhn algorithm check
  const digits = sin.replace(/\s/g, "").split("").map(Number);
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    if (i % 2 === 0) {
      sum += digits[i];
    } else {
      const doubled = digits[i] * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }

  return sum % 10 === 0;
};

// @desc    Sanitize and validate pagination params
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (page < 1) {
    return next(new AppError("Page must be greater than 0", 400));
  }

  if (limit < 1 || limit > 100) {
    return next(new AppError("Limit must be between 1 and 100", 400));
  }

  // Attach validated values to request
  (req as any).pagination = { page, limit, skip: (page - 1) * limit };
  next();
};

// @desc    Validate required query parameters
export const validateQueryParams = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingParams = requiredParams.filter(
      (param) => !req.query[param]
    );

    if (missingParams.length > 0) {
      return next(
        new AppError(
          `Missing required query parameters: ${missingParams.join(", ")}`,
          400
        )
      );
    }

    next();
  };
};

// @desc    Validate enum values
export const validateEnum = (value: string, allowedValues: string[]): boolean => {
  return allowedValues.includes(value);
};

// @desc    Validate money amount
export const validateAmount = (amount: any): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0 && num <= 999999999.99;
};

// @desc    Validate percentage
export const validatePercentage = (value: any): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 100;
};