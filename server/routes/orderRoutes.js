import express from "express";
import { getOrders, getSaleStats } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/saleStats", getSaleStats);

export default router;