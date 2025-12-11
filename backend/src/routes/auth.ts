import express from "express";
import { login, changePassword } from "../controllers/authContoller";
import { verifyToken } from "../middleware/authMiddleware";
const router = express.Router();

router.post("/login", login);

router.put("/change-password", verifyToken, changePassword);


export default router;
