import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { type IUser, type UserRole } from "../models/User";
import ImpersonationGrant from "../models/ImpersonationGrant";
import { isSuperAdmin } from "../constants/roles";
import { JWT_VERIFY_OPTIONS } from "../utils/jwtConfig";

export interface AuthRequest extends Request {
  user?: IUser;
  impersonator?: IUser;
  impersonationGrantId?: string;
}

// @desc    Protect routes - verify JWT token
// @usage   router.get('/profile', protect, getUserProfile)
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Log incoming request for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("[AUTH] Request to:", req.path);
    console.log("[AUTH] Cookies:", req.cookies);
    console.log("[AUTH] Authorization header:", req.headers.authorization);
  }

  // Priority 1: Check for token in cookies (most secure)
  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
    if (process.env.NODE_ENV === "development") {
      console.log("[AUTH] Token found in cookies");
    }
  }
  // Priority 2: Check Authorization header (fallback)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.slice(7); // Remove "Bearer " prefix
    if (process.env.NODE_ENV === "development") {
      console.log("[AUTH] Token found in Authorization header");
    }
  }

  if (!token) {
    console.log("[AUTH] No token found - returning 401");
    return res.status(401).json({
      message: "Not authorized, no token provided",
    });
  }

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      JWT_VERIFY_OPTIONS,
    );

    if (process.env.NODE_ENV === "development") {
      console.log("[AUTH] Token verified for userId:", decoded.userId);
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("[AUTH] User not found in database");
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    const tokenSv = typeof decoded.sessionVersion === "number" ? decoded.sessionVersion : 0;
    const userSv = typeof user.sessionVersion === "number" ? user.sessionVersion : 0;
    if (tokenSv < userSv) {
      return res.status(401).json({
        message: "Session revoked. Please sign in again.",
        code: "SESSION_REVOKED",
      });
    }

    if (user.softDeletedAt) {
      return res.status(403).json({
        message: "Account is unavailable.",
        code: "SOFT_DELETED",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Impersonation: acting as target, real actor is impersonator
    if (decoded.impersonatorId && decoded.grantId) {
      const grant = await ImpersonationGrant.findById(decoded.grantId);
      if (
        !grant ||
        !grant.active ||
        grant.expiresAt.getTime() < Date.now() ||
        grant.targetId.toString() !== user._id.toString()
      ) {
        return res.status(401).json({
          message: "Impersonation session expired",
          code: "IMPERSONATION_EXPIRED",
        });
      }
      const impersonator = await User.findById(decoded.impersonatorId).select(
        "-password",
      );
      if (!impersonator || !isSuperAdmin(impersonator.role) || !impersonator.isActive) {
        return res.status(401).json({
          message: "Impersonation no longer authorized",
          code: "IMPERSONATION_INVALID",
        });
      }
      // Grant must be bound to this exact super actor (prevents grant/claim mismatch)
      if (
        grant.superId.toString() !== String(decoded.impersonatorId) ||
        grant.superId.toString() !== impersonator._id.toString()
      ) {
        return res.status(401).json({
          message: "Impersonation no longer authorized",
          code: "IMPERSONATION_INVALID",
        });
      }
      // Impersonation cannot touch other super_admin settings routes — enforced in super controllers
      req.impersonator = impersonator as IUser;
      req.impersonationGrantId = grant._id.toString();
    }

    // Attach user to request
    req.user = user as IUser;

    // Touch lastActionAt sparsely (every ~2 min)
    const last = user.lastActionAt ? new Date(user.lastActionAt).getTime() : 0;
    if (Date.now() - last > 120_000) {
      User.updateOne(
        { _id: user._id },
        { $set: { lastActionAt: new Date() } },
      ).catch(() => {});
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if ((error as any).name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Not authorized, invalid token",
      });
    }

    if ((error as any).name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Not authorized, token expired",
      });
    }

    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};

// @desc    Authorize by role(s)
// @usage   router.get('/admin', protect, authorize(['admin']), adminRoute)
export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

// @desc    Optional auth - attaches user if token exists, but doesn't block
// @usage   router.get('/content', optionalAuth, getContent)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      JWT_VERIFY_OPTIONS,
    );

    const user = await User.findById(decoded.userId).select("-password");

    if (
      user &&
      user.isActive &&
      !user.softDeletedAt
    ) {
      const tokenSv =
        typeof decoded.sessionVersion === "number" ? decoded.sessionVersion : 0;
      const userSv =
        typeof user.sessionVersion === "number" ? user.sessionVersion : 0;
      if (tokenSv >= userSv) {
        req.user = user as IUser;
      }
    }

    next();
  } catch {
    next();
  }
};

// @desc    Rate limiting helper (simple in-memory implementation)
// @usage   router.post('/login', rateLimiter(5, 60), login)
export const rateLimiter = (maxAttempts: number = 5, windowSeconds: number = 60) => {
  const attempts: Map<string, { count: number; resetTime: number }> = new Map();

  // Clean up old entries every 10 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetTime) {
        attempts.delete(key);
      }
    }
  }, 10 * 60 * 1000);

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const record = attempts.get(key);

    if (!record || now > record.resetTime) {
      // First attempt or window expired
      attempts.set(key, {
        count: 1,
        resetTime: now + windowSeconds * 1000,
      });
      return next();
    }

    if (record.count >= maxAttempts) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      });
    }

    record.count++;
    next();
  };
};

// @desc    Validate request body against required fields
// @usage   router.post('/register', validateBody(['name', 'email', 'password']), register)
export const validateBody = (requiredFields: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    next();
  };
};

// @desc    Sanitize request body (remove XSS, trim strings)
// @usage   app.use(sanitizeBody)
export const sanitizeBody = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.body && typeof req.body === "object") {
    const sanitize = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === "string") {
          // Remove HTML tags
          obj[key] = obj[key].replace(/<[^>]*>/g, "");
          // Trim whitespace
          obj[key] = obj[key].trim();
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };

    sanitize(req.body);
  }

  next();
};

// @desc    Log request details (for debugging)
// @usage   app.use(requestLogger)
export const requestLogger = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const { method, url } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    console.log(
      `${method} ${url} ${statusCode} - ${duration}ms ${req.user ? `[User: ${req.user.email}]` : "[No Auth]"
      }`
    );
  });

  next();
};

// @desc    Check if user owns the resource or is admin
// @usage   router.patch('/:id', protect, checkOwnership('userId'), updateResource)
export const checkOwnership = (resourceField: string = "user") => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Platform admins can access any resource
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      return next();
    }

    // Check if the resource belongs to the user
    const resourceUserId = req.body[resourceField] || req.params.userId;

    if (
      resourceUserId &&
      resourceUserId.toString() === req.user._id.toString()
    ) {
      return next();
    }

    return res.status(403).json({
      message: "You are not authorized to access this resource",
    });
  };
};