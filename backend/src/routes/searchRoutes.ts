import express from "express";
import { globalSearch, quickSearch } from "../controllers/searchController";

const router = express.Router();

// Public search routes
router.get("/", globalSearch);
router.get("/quick", quickSearch);

export default router;