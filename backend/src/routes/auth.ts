import express from "express";
import { login, changePassword, resetPassword, forgotPassword } from "../controllers/authContoller";
import { verifyToken } from "../middleware/authMiddleware";
const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword); // NEW
router.post("/reset-password", resetPassword);   // NEW
router.put("/change-password", verifyToken, changePassword);


export default router;
