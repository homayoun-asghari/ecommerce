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

// CORS setup
const allowedOrigins = [
    "http://192.168.1.106:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://172.20.10.3:3000"
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));

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
