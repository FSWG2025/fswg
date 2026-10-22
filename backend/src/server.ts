import cookieParser from "cookie-parser";
import express, { type Application, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import http from "http";
import { createRouteHandler } from "uploadthing/express";
import { connectDB } from "./config/db";
import userRoutes from "./routes/userRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import leadRoutes from "./routes/leadRoutes";
import visitorRoutes from "./routes/visitorRoutes";
import consultationRoutes from "./routes/consultationRoutes";
import rentalApplicationRoutes from "./routes/rentalApplicationRoutes";
import contentRoutes from "./routes/contentRoutes";
import auditLogRoutes from "./routes/auditLogRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import searchRoutes from "./routes/searchRoutes";
import advisorApplicationRoutes from "./routes/advisorApplicationRoutes";
import funnelRoutes from "./routes/funnelRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import messageRoutes from "./routes/messageRoutes";
import noteRoutes from "./routes/noteRoutes";
import vaultRoutes from "./routes/vaultRoutes";
import approvalRoutes from "./routes/approvalRoutes";
import superRoutes from "./routes/superRoutes";
import systemRoutes from "./routes/systemRoutes";
import { ourFileRouter } from "./uploadthing";
import { initSocketServer } from "./socket/io";
import { registerVideoSignaling } from "./socket/videoSignaling";
import { serve } from "inngest/express";
import { inngest, functions } from "./ingest/index";
import { generateSitemap } from "./controllers/sitemapController";
import { auditTrail } from "./middleware/auditTrail";
import { protect, optionalAuth } from "./middleware/auth";
import { csrfGuard } from "./middleware/csrfGuard";
import { maintenanceGate } from "./middleware/maintenanceGate";
import { botGuard } from "./middleware/botGuard";
import { isPlatformAdmin, RENTAL_STAFF_ROLES } from "./constants/roles";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Trust the first proxy hop so req.ip is the real client (needed for allowlists / rate limits)
app.set("trust proxy", 1);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Allow in-app PDF preview (iframe / object)
    contentSecurityPolicy: false,
    frameguard: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.STAGE === "development") {
  app.use(morgan("dev"));
}

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://www.firststepwealthgroup.ca",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Non-browser clients (no Origin) are allowed; browsers must match exactly
      if (!origin) return callback(null, true);
      if (allowedOrigins.filter(Boolean).includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

function sendUploadFile(filePath: string, res: Response) {
  const name = path.basename(filePath);
  const ext = path.extname(name).toLowerCase();
  const mime =
    ext === ".pdf"
      ? "application/pdf"
      : ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : undefined;

  res.setHeader("Content-Disposition", `inline; filename="${name}"`);
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Allow embedding from the Vite/client origin
  res.removeHeader("X-Frame-Options");
  if (mime) res.type(mime);

  return res.sendFile(path.resolve(filePath));
}

/**
 * Uploads hold PII (rental docs, IDs).
 * Public marketing images under /uploads/images stay readable without a token.
 * Documents/others: staff only (not every logged-in client).
 */
app.use("/uploads", (req, res, next) => {
  const requested = path.normalize(req.path).replace(/^(\.\.[/\\])+/, "");
  const isPublicImage =
    requested.startsWith("/images/") ||
    requested.startsWith("images/");
  if (isPublicImage) return next();
  return protect(req as any, res, () => {
    const role = (req as any).user?.role as string | undefined;
    const staffOk =
      isPlatformAdmin(role) ||
      (RENTAL_STAFF_ROLES as readonly string[]).includes(role || "");
    if (!staffOk) {
      return res.status(403).json({
        message: "Not authorized to access uploaded documents",
      });
    }
    return next();
  });
});

/** Serve /uploads; if a bare filename is requested, also look in documents|images|others. */
app.use("/uploads", (req, res, next) => {
  const requested = path.normalize(req.path).replace(/^(\.\.[/\\])+/, "");
  const isPublicImage =
    requested.startsWith("/images/") || requested.startsWith("images/");
  // Block path traversal outside uploadsDir (prefix check must use path.sep)
  const direct = path.resolve(path.join(uploadsDir, requested));
  const uploadsRoot = path.resolve(uploadsDir);
  if (
    direct !== uploadsRoot &&
    !direct.startsWith(uploadsRoot + path.sep)
  ) {
    return res.status(400).json({ message: "Invalid path" });
  }
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    return sendUploadFile(direct, res);
  }
  const base = path.basename(requested);
  if (base && base !== "." && base !== "..") {
    // Public /images must never fall through into documents/others
    const order = isPublicImage
      ? (["images"] as const)
      : (["documents", "others", "images"] as const);
    for (const sub of order) {
      const alt = path.join(uploadsDir, sub, base);
      if (fs.existsSync(alt) && fs.statSync(alt).isFile()) {
        return sendUploadFile(alt, res);
      }
    }
  }
  next();
});
app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders(res, filePath) {
      const name = path.basename(filePath);
      res.setHeader("Content-Disposition", `inline; filename="${name}"`);
      res.removeHeader("X-Frame-Options");
      if (filePath.toLowerCase().endsWith(".pdf")) {
        res.type("application/pdf");
      }
    },
  }),
);

app.get("/robots.txt", (req: Request, res: Response) => {
  const site = (process.env.CLIENT_URL || "https://firststepwealthgroup.ca").replace(
    /\/$/,
    ""
  );
  res.type("text/plain");
  res.send(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /dashboard",
      "Disallow: /login",
      "Disallow: /register",
      "Disallow: /forgot-password",
      "Disallow: /reset-password",
      "Disallow: /app/",
      "",
      `Sitemap: ${site}/sitemap.xml`,
      "",
    ].join("\n")
  );
});

app.get("/sitemap.xml", generateSitemap);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "First Step Wealth Group Platform" });
});

/** Attach user when present so maintenance / bot gates can allow supers. */
app.use("/api", optionalAuth);
app.use("/api", csrfGuard);
app.use("/api", botGuard);
app.use("/api", maintenanceGate);

/** Record every successful mutating API call in Activity Log (skips if controller already logged). */
app.use("/api", auditTrail);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "fswg-api" });
});

app.use("/api/system", systemRoutes);
app.use("/api/super", superRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/rental-applications", rentalApplicationRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/advisor-applications", advisorApplicationRoutes);
app.use("/api/funnel", funnelRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/vault", vaultRoutes);
app.use("/api/approvals", approvalRoutes);

if (process.env.UPLOADTHING_TOKEN) {
  app.use(
    "/api/uploadthing",
    createRouteHandler({
      router: ourFileRouter,
      config: {
        token: process.env.UPLOADTHING_TOKEN,
      },
    })
  );
} else {
  console.warn("[UploadThing] UPLOADTHING_TOKEN not set — document vault uploads disabled");
}

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: functions,
  })
);

app.use((err: Error, req: Request, res: Response, next: Function) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const httpServer = http.createServer(app);

connectDB().then(() => {
  const io = initSocketServer(httpServer, allowedOrigins);
  registerVideoSignaling(io);
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
