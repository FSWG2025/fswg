import express from "express";
import { protect, rateLimiter } from "../middleware/auth";
import {
  requireSuperAdmin,
  requireSuperOrImpersonator,
  requireConfirmPhrase,
} from "../middleware/requireSuperAdmin";
import {
  getPulse,
  getSettings,
  patchSettings,
  health,
  listPeople,
  suspendUser,
  restoreUser,
  forceLogoutUser,
  softDeleteUser,
  changeRole,
  setRiskFlags,
  addInternalNote,
  compromisedPlaybook,
  startImpersonation,
  endImpersonation,
  getImpersonationStatus,
  visitorsMap,
  enrichVisitorGeo,
  forensics,
  activityStream,
  exportActivity,
  listWatchlist,
  addWatchlist,
  removeWatchlist,
  listPromos,
  upsertPromo,
  killPromo,
  killAllPromos,
  listBotBlocks,
  unblockBot,
  broadcast,
} from "../modules/super";

const router = express.Router();

const godLimit = rateLimiter(60, 60);

// Impersonation exit/status must work while acting as the target user
router.delete(
  "/impersonate",
  protect,
  requireSuperOrImpersonator,
  godLimit,
  endImpersonation,
);
router.get(
  "/impersonate/status",
  protect,
  requireSuperOrImpersonator,
  godLimit,
  getImpersonationStatus,
);

router.use(protect, requireSuperAdmin, godLimit);

router.get("/health", health);
router.get("/pulse", getPulse);

router.get("/settings", getSettings);
router.patch("/settings", patchSettings);

router.get("/people", listPeople);
router.post(
  "/users/:id/suspend",
  requireConfirmPhrase("SUSPEND"),
  suspendUser,
);
router.post("/users/:id/restore", restoreUser);
router.post("/users/:id/force-logout", forceLogoutUser);
router.post(
  "/users/:id/soft-delete",
  requireConfirmPhrase("DELETE"),
  softDeleteUser,
);
router.post("/users/:id/role", changeRole);
router.post("/users/:id/flags", setRiskFlags);
router.post("/users/:id/notes", addInternalNote);
router.post(
  "/users/:id/compromised-playbook",
  requireConfirmPhrase("COMPROMISED"),
  compromisedPlaybook,
);

router.post("/impersonate/:id", startImpersonation);

router.get("/visitors/map", visitorsMap);
router.post("/visitors/:visitorId/enrich-geo", enrichVisitorGeo);
router.get("/forensics/:type/:id", forensics);

router.get("/activity/stream", activityStream);
router.get("/activity/export", exportActivity);

router.get("/watchlist", listWatchlist);
router.post("/watchlist", addWatchlist);
router.delete("/watchlist/:id", removeWatchlist);

router.get("/promos", listPromos);
router.post("/promos", upsertPromo);
router.post(
  "/promos/kill-all",
  requireConfirmPhrase("KILL_PROMO"),
  killAllPromos,
);
router.post("/promos/:id/kill", killPromo);

router.get("/bots", listBotBlocks);
router.delete("/bots/:id", unblockBot);
router.post("/broadcast", broadcast);

export default router;
