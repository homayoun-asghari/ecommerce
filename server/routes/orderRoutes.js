import express from "express";
import { getOrders, getSaleStats, getSellerOrders } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/saleStats", getSaleStats);
router.get("/sellerorders", getSellerOrders);

export default router;