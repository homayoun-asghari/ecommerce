import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

passport.use(
    "google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                let user = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]);
                if (user.rows.length === 0) {
                    const newUser = await db.query(
                        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
                        [profile.displayName, profile.email]
                    );
                    user = newUser;
                }
                return cb(null, user.rows[0]);
            } catch (err) {
                return cb(err, null);
            }
        }
    )
);

export default passport;
