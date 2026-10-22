import express from "express";
import { optionalAuth } from "../middleware/auth";
import { getPublicSettings, health } from "../modules/super/settings.controller";
import { publicPromos } from "../modules/super/promo.controller";

const router = express.Router();

router.get("/public", getPublicSettings);
router.get("/health", health);
router.get("/promos", optionalAuth, publicPromos);

export default router;
