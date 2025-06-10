import express from "express";
import { updateUser, updateRole, getAccountDetails } from "../controllers/userController.js";
import { authenticateJWT } from "../middlewares/auth.js";


const router = express.Router();

router.post("/updateuser", updateUser);
router.post("/updaterole", updateRole);
router.get("/account", authenticateJWT, getAccountDetails);

export default router;