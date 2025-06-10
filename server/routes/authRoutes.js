import express from "express";
import passport from "../config/passport.js"
import { register, login, forgetPassword, resetPassword, googleCallbackHandler } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgetpassword", forgetPassword);
router.post("/resetpassword", resetPassword);
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
}));
router.get("/google/callback",
    passport.authenticate("google", {
        failureRedirect: "http://localhost:3000/account",
        session: false
    }),
    googleCallbackHandler
);

export default router;