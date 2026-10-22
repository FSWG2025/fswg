import express from "express";
import {
  register,
  login,
  logoutUser,
  getUserProfile,
  updateOwnProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  changePassword,
  getConsultants,
  exportUsers,
} from "../modules/users";
import { protect, authorize, optionalAuth, rateLimiter } from "../middleware/auth";
import { USER_ADMIN_ROLES, USER_MANAGE_ROLES } from "../constants/roles";

const router = express.Router();

const authLimit = rateLimiter(10, 60);
const resetLimit = rateLimiter(5, 300);

// Public self-register; optionalAuth so admins creating staff accounts are recognized
router.post("/register", authLimit, optionalAuth, register);
router.post("/login", authLimit, login);
router.post("/logout", optionalAuth, logoutUser);
router.post("/forgot-password", resetLimit, forgotPassword);
router.post("/reset-password/:token", resetLimit, resetPassword);

// Protected routes (any authenticated user)
router.get("/profile", protect, getUserProfile);
router.patch("/profile", protect, updateOwnProfile);
router.get("/consultants", protect, getConsultants);
router.put("/change-password", protect, changePassword);

// Staff user management
router.get("/", protect, authorize(USER_MANAGE_ROLES), getUsers);
router.get("/export", protect, authorize(USER_ADMIN_ROLES), exportUsers);
router.get("/:id", protect, authorize(USER_MANAGE_ROLES), getUserById);
router.put("/:id", protect, authorize(USER_MANAGE_ROLES), updateUser);
router.delete("/:id", protect, authorize(USER_ADMIN_ROLES), deleteUser);

export default router;
