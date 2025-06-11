import express from "express";
import { checkout, updateDBCart, getDBCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/checkout", checkout);
router.post("/updateDBCart", updateDBCart);
router.get("/getDBCart", getDBCart);

export default router;