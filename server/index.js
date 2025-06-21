import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "./config/passport.js"; // initialize passport config
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import addressRoute from "./routes/addressRoutes.js";
import cartRoute from "./routes/cartRoutes.js";
import ticketRoute from "./routes/ticketRoutes.js";
import notificationRoute from "./routes/notificationRoutes.js";
import paymentRoute from "./routes/paymentRoutes.js";
import adminRoute from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(passport.initialize());

const port = process.env.PORT || 5050;

// CORS setup - permissive for development
console.log('Setting up CORS with permissive settings for development');
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Total-Count']
}));

// Log all incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
app.use("/product", productRoutes);
app.use("/review", reviewRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/order", orderRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/address", addressRoute);
app.use("/cart", cartRoute);
app.use("/ticket", ticketRoute);
app.use("/notification", notificationRoute);
app.use("/payment", paymentRoute);
app.use("/admin", adminRoute);
app.use("/contacts", contactRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
