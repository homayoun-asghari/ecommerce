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
  addTicketResponse,
  getReviews,
  deleteReview,
  getNotifications,
  createNotification,
  updateNotificationStatus,
  deleteNotification,
  markNotificationsAsRead,
  deleteNotificationsBatch,
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getSettings,
  updateSettings,
  getDocuments,
  saveDocument,
  updateEmailTemplate
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

// Review management routes
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

// Blog management routes
router.get('/blog', getBlogPosts);
router.post('/blog', createBlogPost);
router.put('/blog/:id', updateBlogPost);
router.delete('/blog/:id', deleteBlogPost);

// Settings management routes
router.get('/settings', getSettings);
router.post('/settings', updateSettings);

// Document management routes
router.get('/documents', getDocuments);
router.post('/documents', saveDocument);

// Email template routes
router.post('/email-templates', updateEmailTemplate);

// Notification management routes
router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);
router.put('/notifications/:id/status', updateNotificationStatus);
router.delete('/notifications/:id', deleteNotification);
router.put('/notifications/mark-read', markNotificationsAsRead);
router.delete('/notifications/batch', deleteNotificationsBatch);

export default router;