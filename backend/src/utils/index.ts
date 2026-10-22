// Barrel export for all utilities

// Token utilities
export {
  generateToken,
  generateShortLivedToken,
  verifyToken,
  clearToken,
  decodeToken,
} from "./generateToken";

// Audit logging
export {
  logAudit,
  logAuditFromRequest,
  logSystemAudit,
  getRecentLogs,
  cleanupOldLogs,
} from "./logAudit";

// Email service
export {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendConsultationConfirmation,
} from "./emailService";

// General helpers
export {
  generateRandomString,
  generateSlug,
  formatCurrency,
  formatDate,
  formatTime,
  truncateText,
  sanitizeString,
  capitalize,
  formatEnumValue,
  getPaginationMeta,
  buildFilter,
  parseBoolean,
  parseNumber,
} from "./helpers";

// Validators
export {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidObjectId,
  isValidUrl,
  isValidPostalCode,
  isValidDate,
  isInRange,
  getMissingFields,
  isValidLength,
} from "./validators";