import express from 'express';
import pg from "pg";
import env from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import nodemailer from "nodemailer";

env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE
});
db.connect();

const app = express();
app.use(express.json());
const port = 5050;
const saltRounds = 10;

const allowedOrigins = [
    "http://192.168.1.106:3000", // phone
    "http://localhost:3000",     // desktop
    "http://127.0.0.1:3000"      // another local version
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());


app.get("/products/newarrivals", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT p.*, 
                AVG(r.rating) AS avg_rating, 
                COUNT(r.id) AS review_count
            FROM products p
            LEFT JOIN reviews r ON p.id = r.product_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT 10;

          `);


        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch new arrivals" });
    }
});

app.get("/products/bestsellers", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                p.*, 
                SUM(oi.quantity) AS total_quantity_sold,
                AVG(r.rating) AS avg_rating, 
                COUNT(r.id) AS review_count
            FROM products p
            LEFT JOIN reviews r ON p.id = r.product_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            GROUP BY p.id
            ORDER BY total_quantity_sold DESC
            LIMIT 10;

          `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch best sellers" });
    }
});

app.get("/products/especialoffers", async (req, res) => {
    const discount = parseFloat(req.query.discount);
    try {
        const result = await db.query(`
            SELECT 
                p.*, 
                AVG(r.rating) AS avg_rating,
                COUNT(r.rating) AS review_count
            FROM products p
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.discount > $1
            GROUP BY p.id
            ORDER BY p.discount DESC
            LIMIT 10;
          `, [discount]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch especial offers" });
    }
});

app.get("/product", async (req, res) => {
    const id = req.query.id;
    try {
        const result = await db.query(`
            SELECT p.*, 
                AVG(r.rating) AS avg_rating,
                COUNT(r.rating) AS review_count
            FROM products p
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.id = $1
            GROUP BY p.id`, [id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch product" });
    }

})


app.get("/review", async (req, res) => {
    const id = req.query.id;
    try {
        const result = await db.query(`
            SELECT r.*,
                u.name as username
            FROM reviews r
            LEFT JOIN users as u ON r.user_id = u.id
            WHERE r.product_id = $1
            ORDER BY created_at DESC`, [id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch review" });
    }

})

app.get("/related", async (req, res) => {
    const category = req.query.category;
    try {
        const result = await db.query(`
            SELECT *
            FROM products
            WHERE category = $1
            LIMIT 10`, [category]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch related" });
    }

})

// POST endpoint for registration
app.post("/register", async (req, res) => {
    const { name, email, password, confirmPassword, role } = req.body;

    try {
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Check if the user already exists
        const checkUser = await db.query(`
            SELECT * FROM users WHERE email = $1`, [email]);

        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Define userRole based on the provided role
        let userRole; // Declare userRole outside the if/else block
        if (role === "customer") {
            userRole = "buyer";  // Assign value to userRole
        } else if (role === "vendor") {
            userRole = "seller";  // Assign value to userRole
        } else {
            return res.status(400).json({ error: "Invalid role. Allowed roles: Customer, Vendor." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user into the database
        const result = await db.query(`
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING *`, [name, email, hashedPassword, userRole]);

        // Send success response
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to register user" });
    }
});


app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (user.rows.length > 0) {
            const match = await bcrypt.compare(password, user.rows[0].password);
            if (match) {
                const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.status(201).json({ token: token });
            } else {
                return res.status(400).json({ error: "Password does not match." })
            }
        } else {
            return res.status(400).json({ error: "You are not Registered Yet." })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to register user" });
    }
});

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get("/account", authenticateJWT, async (req, res) => {
    const id = req.user.userId;
    const result = await db.query(`SELECT name, email, role FROM users WHERE id = $1`, [id]);
    res.status(200).json({ data: result.rows[0] })
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }), async (req, res) => {
    try {
        const userRole = await db.query(`SELECT role FROM users WHERE id = $1`, [req.user.id]);
        if (userRole === null) {
            res.redirect(`http://localhost:3000/chooserole?id=${req.user.id}`);
        } else {
            const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.redirect(`http://localhost:3000/account?token=${token}`);
        }

    } catch (err) {
        console.log(err);
    }

});

app.post("/updaterole", async (req, res) => {
    const id = req.query.id;
    let role;

    if (req.body.role === "customer") {
        role = "buyer";
    } else {
        role = "seller";
    }
    try {
        await db.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, id]);
        const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }

});

app.post("/forgetpassword", async (req, res) => {
    const { email } = req.body;

    try {
        const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);

        if (result.rows.length > 0) {
            const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const link = `http://localhost:3000/resetpassword?token=${token}`;
            console.log(link);
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_SMTP,
                port: parseInt(process.env.EMAIL_PORT),
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset',
                text: `Click this link to reset your password: ${link}`,
            };

            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: "Password reset link sent to email" });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post("/resetpassword", async (req, res) => {
    const { token } = req.query;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, decoded.userId]);

        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: "Invalid or expired token" });
    }
});


passport.use(
    "google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5050/auth/google",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                // console.log(profile);
                const result = await db.query("SELECT * FROM users WHERE email = $1", [
                    profile.email,
                ]);
                if (result.rows.length === 0) {
                    const newUser = await db.query(
                        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
                        [profile.displayName, profile.email, "google"]
                    );
                    return cb(null, newUser.rows[0]);
                } else {
                    return cb(null, result.rows[0]);
                }
            } catch (err) {
                return cb(err);
            }
        }
    )
);
passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

app.listen(port, '0.0.0.0', () => console.log('Server running on port 5050'));
