import express from "express";
import { getReview, getProductReview, updateReview } from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getReview);
router.get("/productuserreview", getProductReview);
router.post("/updatereview", updateReview);


export default router;
