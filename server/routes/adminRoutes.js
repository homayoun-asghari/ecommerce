import express from "express";
import { 
  getOverview, 
  getMonthlyOrders, 
  getUsers, 
  getUserStats,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  getPayments,
  getPaymentDetails,
  processPayout,
  getPayouts,
  updatePayoutStatus,
  getTickets,
  getTicketDetails,
  updateTicketStatus,
  addTicketResponse
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

// Order management routes
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id/status', updateOrderStatus);

// Payment management routes
router.get('/payments', getPayments);
router.get('/payments/:id', getPaymentDetails);
router.post('/payments/:id/process-payout', processPayout);
router.get('/payouts', getPayouts);
router.put('/payouts/:id/status', updatePayoutStatus);

// Ticket management routes
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketDetails);
router.put('/tickets/:id/status', updateTicketStatus);
router.post('/tickets/:id/respond', addTicketResponse);

export default router;