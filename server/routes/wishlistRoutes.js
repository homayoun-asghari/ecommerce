import express from "express";
import { getWhishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", getWhishlist);
router.post("/", addToWishlist);
router.delete("/", removeFromWishlist);

export default router;