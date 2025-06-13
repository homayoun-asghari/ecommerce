import express from "express";
import { searchProducts, getProduct, getNewArrivals, getBestSellers, getEspecialOffers, getRelatedProducts, getSellersProducts, addProduct } from "../controllers/productController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();
router.get("/", getProduct);
router.post("/", upload.single('image'), addProduct);
router.get("/newarrivals", getNewArrivals);
router.get("/bestsellers", getBestSellers);
router.get("/especialoffers", getEspecialOffers);
router.get("/related", getRelatedProducts);
router.get("/sellersproducts", getSellersProducts);
router.get("/search", searchProducts);

export default router;
