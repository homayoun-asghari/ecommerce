import express from "express";
import { getProduct, getNewArrivals, getBestSellers, getEspecialOffers, getRelatedProducts } from "../controllers/productController.js";

const router = express.Router();
router.get("/", getProduct);
router.get("/newarrivals", getNewArrivals);
router.get("/bestsellers", getBestSellers);
router.get("/especialoffers", getEspecialOffers);
router.get("/related", getRelatedProducts);


export default router;
