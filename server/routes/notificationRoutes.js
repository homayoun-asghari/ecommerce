import express from "express";
import { getNotification, addNotification, updateNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotification);
router.post("/", addNotification);
router.put("/:id/read", updateNotification);

export default router;