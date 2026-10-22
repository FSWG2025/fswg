// Export all middleware from a single file
export {
  protect,
  authorize,
  optionalAuth,
  rateLimiter,
  validateBody,
  sanitizeBody,
  requestLogger,
  checkOwnership,
} from "./auth";

export type { AuthRequest } from "./auth";

export {
  upload,
  uploadImage,
  uploadDocument,
  uploadAvatar,
  handleMulterError,
  deleteFile,
  getFileUrl,
} from "./upload";

export {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
} from "./errorHandler";

export {
  validateEmail,
  validatePhone,
  validatePassword,
  isValidObjectId,
  isValidDate,
  isValidUrl,
  validatePostalCode,
  validateSIN,
  validatePagination,
  validateQueryParams,
  validateEnum,
  validateAmount,
  validatePercentage,
} from "./validation";