import express from "express";
import { 
    getProduct, 
    getNewArrivals, 
    getBestSellers, 
    getEspecialOffers, 
    getRelatedProducts, 
    searchProducts, 
    getSellersProducts, 
    addProduct,
    updateProduct,
    deleteProduct,
    getShopProducts 
} from "../controllers/productController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Product routes
router.get("/", getProduct);
router.get("/newarrivals", getNewArrivals);
router.get("/bestsellers", getBestSellers);
router.get("/especialoffers", getEspecialOffers);
router.get("/related", getRelatedProducts);
router.get("/search", searchProducts);
router.get("/shop", getShopProducts);
router.get("/sellersproducts", getSellersProducts);
router.post("/", upload.single('image'), addProduct);
router.put("/:id", upload.single('image'), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
