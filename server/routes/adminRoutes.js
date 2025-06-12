import express from "express";
import { 
  getOverview, 
  getMonthlyOrders, 
  getUsers, 
  getUserStats,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct 
} from '../controllers/adminController.js';

const router = express.Router();

// Admin dashboard overview
router.get('/overview', getOverview);

// Monthly order data for charts
router.get('/monthly-orders', getMonthlyOrders);

// User management routes
router.get('/users', getUsers);
router.get('/users/:id/stats', getUserStats);

// Product management routes
router.get('/products', getProducts);
router.get('/product/:id', getProduct);
router.put('/product/:id', updateProduct);
router.delete('/product/:id', deleteProduct);

export default router;