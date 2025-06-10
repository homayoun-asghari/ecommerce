import express from 'express';
import pg from "pg";
import env from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

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

app.use(passport.initialize());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: function (req, file, cb) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, JPEG, and PNG files are allowed"));
        }
    }
});




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
    const { name, email, password, confirmPassword, role } = req.body || req.query;

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

app.post("/updateuser", async (req, res) => {

    try {
        if (req.body.name) {
            const result = await db.query(`
            UPDATE users SET name = $1 WHERE id = $2`, [req.body.name, req.body.id]);
        }

        if (req.body.email) {
            const result = await db.query(`
            UPDATE users SET email = $1 WHERE id = $2`, [req.body.email, req.body.id]);
        }

        if (req.body.password || req.body.confirmPassword) {
            // Check if passwords match
            if (req.body.password !== req.body.confirmPassword) {
                return res.status(400).json({ error: "Passwords do not match" });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            const result = await db.query(`
            UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, req.body.id]);
        }

        res.status(201).json({ message: "User updated" });


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
            if (!user.rows[0].password) {
                return res.status(403).json({ error: "No password set. Please log in with Google." });
            }
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
    const result = await db.query(`SELECT id, name, email, role FROM users WHERE id = $1`, [id]);
    res.status(200).json({ data: result.rows[0] })
});

app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
}));

app.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/account",
    session: false // ✅ No session!
}), async (req, res) => {
    try {
        const roleCheck = await db.query("SELECT role FROM users WHERE id = $1", [req.user.id]);
        const role = roleCheck.rows[0]?.role;

        const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        if (!role) {
            res.redirect(`http://localhost:3000/account?id=${req.user.id}`);
        } else {
            res.redirect(`http://localhost:3000/account?token=${token}`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("OAuth callback error");
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
            const link = `http://localhost:3000/account?resetpassword=${token}`;
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

app.get("/orders", async (req, res) => {
    const { userId, status } = req.query;

    try {
        const queryBase = `
            SELECT 
                o.id AS order_id,
                o.status,
                o.created_at,
                json_agg(json_build_object(
                    'product_id', p.id,
                    'name', p.name,
                    'price', p.price,
                    'image_url', p.image_url,
                    'quantity', oi.quantity,
                    'rating', r.rating,
                    'comment', r.comment
                )) AS products
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN reviews r ON p.id = r.product_id AND r.user_id = $1
            WHERE o.buyer_id = $1
            ${status ? "AND o.status = $2" : ""}
            GROUP BY o.id, o.status, o.created_at
            ORDER BY o.created_at DESC
            ${!status ? "LIMIT 10" : ""}
        `;

        const params = status ? [userId, status] : [userId];
        const result = await db.query(queryBase, params);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});


app.get("/productuserreview", async (req, res) => {
    const { userId, productId } = req.query;
    try {
        const result = await db.query(`SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2`, [productId, userId]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.log(err);
    }
});

app.post("/updatereview", async (req, res) => {
    const { rating, comment } = req.body;
    const { userId, productId } = req.query;

    try {
        const check = await db.query(
            "SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2",
            [productId, userId]
        );

        let result;

        if (check.rows.length > 0) {
            // REVIEW EXISTS → UPDATE
            result = await db.query(
                "UPDATE reviews SET rating = $1, comment = $2 WHERE product_id = $3 AND user_id = $4 RETURNING *",
                [rating, comment, productId, userId]
            );
        } else {
            // REVIEW DOES NOT EXIST → INSERT
            result = await db.query(
                "INSERT INTO reviews (rating, comment, product_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
                [rating, comment, productId, userId]
            );
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update or add review" });
    }
});


// ✅ Fetch wishlist
app.get("/wishlist", async (req, res) => {
    const { userId } = req.query;
    try {
        const result = await db.query(`
           SELECT p.*
            FROM products p
            INNER JOIN wishlist w ON p.id = w.product_id
            WHERE w.user_id = $1;`, [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
});

// ✅ Add to wishlist
app.post("/wishlist", async (req, res) => {
    const { productId, userId } = req.body;
    try {
        // First, insert the wishlist entry (no duplicate thanks to ON CONFLICT DO NOTHING)
        await db.query(
            `INSERT INTO wishlist (user_id, product_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [userId, productId]
        );

        // Now return the joined product data like your GET route
        const result = await db.query(
            `SELECT w.*, p.* 
             FROM wishlist w
             JOIN products p ON w.product_id = p.id
             WHERE w.user_id = $1 AND w.product_id = $2`,
            [userId, productId]
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add to wishlist" });
    }
});


// ✅ Remove from wishlist
app.delete("/wishlist", async (req, res) => {
    const { productId, userId } = req.body;
    try {
        await db.query(
            `DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2`,
            [userId, productId]
        );
        res.status(200).json({ message: "Removed from wishlist" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to remove from wishlist" });
    }
});


app.get("/addresses", async (req, res) => {
    const { userId } = req.query;
    try {
        const result = await db.query(`
            SELECT * FROM addresses 
            WHERE user_id = $1 
            ORDER BY is_default DESC
        `, [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch addresses" });
    }
});

app.post("/addaddress", async (req, res) => {
    const { full_name, street, city, state, postal_code, country, phone, is_default } = req.body;
    const { userId } = req.query;
    try {
        const check = await db.query(
            `SELECT * FROM addresses
            WHERE user_id = $1 AND full_name = $2 AND street = $3 AND city = $4
            AND state = $5 AND country = $6 AND phone = $7`,
            [userId, full_name, street, city, state, country, phone]
        );

        if (check.rows.length > 0) {
            return res.status(400).json({ error: "Address already exists" });
        }

        if (is_default) {
            await db.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [userId]);
        }

        const result = await db.query("INSERT INTO addresses (user_id, full_name, street, city, state, postal_code, country, phone, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *", [userId, full_name, street, city, state, postal_code, country, phone, is_default]);

        res.status(200).json({ message: "Address added" })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to add address" })
    }
})

app.post("/setdefaultaddress", async (req, res) => {
    const { userId, addressId } = req.body;
    try {
        // Step 1: Remove default from all user's addresses
        await db.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [userId]);

        // Step 2: Set selected address as default
        await db.query("UPDATE addresses SET is_default = true WHERE user_id = $1 AND id = $2", [userId, addressId]);

        res.status(200).json({ message: "Default address updated successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to set default address." });
    }
});

app.get("/deleteaddress", async (req, res) => {
    const { addressId } = req.query;
    try {
        const result = await db.query("DELETE FROM addresses WHERE id = $1", [addressId]);
        res.status(200).json({ message: "Address deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete address" })
    }
})

app.post("/checkout", async (req, res) => {
    const { name, email, street, city, state, postal_code, country, phone, cart, shipping, password, confirmPassword } = req.body;
    const { shippingName, shippingStreet, shippingCity, shippingState, shippingPostal_code, shippingCountry, shippingPhone, } = req.body;
    let addressId = req.body.addressId;
    let userId = req.body.userId;
    let total = shipping === "flat" ? 15 : 0;

    for (const item of cart) {
        total += item.quantity * item.price;
    }

    try {
        // Check stock
        for (const item of cart) {
            const stockRes = await db.query("SELECT stock FROM products WHERE id = $1", [item.id]);
            const stock = stockRes.rows[0].stock;
            if (item.quantity > stock) {
                return res.status(200).json({ message: `Only ${stock} of ${item.name} left.` });
            }
        }

        // If creating account
        if (req.body.password && req.body.confirmPassword) {
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

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert the new user into the database
            const result = await db.query(`
                INSERT INTO users (name, email, password, role)
                VALUES ($1, $2, $3, $4)
                RETURNING id`, [name, email, hashedPassword, "buyer"]);
            userId = result.rows[0].id;
        }

        // add address 
        if (street) {
            if (!shippingStreet) {
                const add = await db.query("INSERT INTO addresses (user_id, full_name, street, city, state, postal_code, country, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id ", [userId, name, street, city, state, postal_code, country, phone]);
                addressId = add.rows[0].id;
            } else {
                const add = await db.query("INSERT INTO addresses (user_id, full_name, street, city, state, postal_code, country, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id ", [userId, shippingName, shippingStreet, shippingCity, shippingState, shippingPostal_code, shippingCountry, shippingPhone]);
                addressId = add.rows[0].id;
            }
        }

        // Create order
        const orderRes = await db.query(
            "INSERT INTO orders (buyer_id, status, total, address_id) VALUES ($1, $2, $3, $4) RETURNING id",
            [userId, "pending", total, addressId]
        );
        const orderId = orderRes.rows[0].id;

        // Insert items into order_items table
        for (const item of cart) {
            await db.query(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
                [orderId, item.id, item.quantity, item.price]
            );

            // Reduce stock
            await db.query(
                "UPDATE products SET stock = stock - $1 WHERE id = $2",
                [item.quantity, item.id]
            );
        }

        res.status(200).json({ message: "Now you are redirecting to payment page!" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to checkout" });
    }
});

app.post("/updateDBCart", async (req, res) => {
    const { userId, cartItems } = req.body;

    try {
        const dbCartItems = await db.query("SELECT * FROM cart_items WHERE user_id = $1", [userId]);
        const dbItems = dbCartItems.rows;

        for (const item of cartItems) {
            await db.query(
                `INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, product_id)
                DO UPDATE SET quantity = EXCLUDED.quantity`,
                [userId, item.id, item.quantity]
            );
        }

        // Remove deleted items
        for (const dbItem of dbItems) {
            const stillExists = cartItems.some(item => item.id === dbItem.product_id);
            if (!stillExists) {
                await db.query(
                    "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
                    [userId, dbItem.product_id]
                );
            }
        }

        res.status(200).json({ message: "Cart updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update cart" });
    }
});

app.get("/getDBCart", async (req, res) => {
    const { userId } = req.query;
    try {
        const result = await db.query("SELECT * FROM cart_items WHERE user_id = $1", [userId]);
        const dbCart = result.rows;
        res.status(200).json(dbCart);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch DB cart" });
    }
})

app.get("/tickets", async (req, res) => {
    const { userId, status } = req.query;
    try {
        const result = await db.query("SELECT * FROM tickets WHERE user_id = $1 AND status = $2", [userId, status]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch tickets." })
    }
})

app.get("/ticktMessages", async (req, res) => {
    const { ticketId } = req.query;
    try {
        const result = await db.query("SELECT * FROM ticket_messages WHERE ticket_id = $1", [ticketId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch messages." })
    }
})

app.post("/addTicket", upload.single("attachment"), async (req, res) => {
    const { userId, userRole, category, subject, order_id, message } = req.body;
    let attachmentUrl = null;

    if (!req.file) {
        return res.status(400).json({ error: "No valid image file uploaded." });
    }

    try {
        // 1. Upload file if exists
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto" },
                    (error, result) => (error ? reject(error) : resolve(result))
                );
                stream.end(req.file.buffer);
            });

            attachmentUrl = result.secure_url;
        }

        // 2. Insert ticket
        const ticket = await db.query(
            "INSERT INTO tickets (user_id, user_role, order_id, category, subject) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [userId, userRole, order_id, category, subject]
        );

        const ticketId = ticket.rows[0].id;

        // 3. Insert first ticket message
        await db.query(
            "INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message, attachment) VALUES ($1, $2, $3, $4, $5)",
            [ticketId, userId, userRole, message, attachmentUrl]
        );

        //4. send notification
        await db.query(
            "INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)",
            [userId, "Ticket Created", "Your support ticket has been opened."]
        );


        res.status(200).json({ message: "Ticket opened." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to open new ticket." });
    }
});

app.post("/addTicketMessage", upload.single("attachment"), async (req, res) => {
    const { message, ticketId, senderId, senderType } = req.body;
    let attachmentUrl = null;

    if (!req.file) {
        return res.status(400).json({ error: "No valid image file uploaded." });
    }

    try {
        // 1. Upload file if exists
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto" },
                    (error, result) => (error ? reject(error) : resolve(result))
                );
                stream.end(req.file.buffer);
            });

            attachmentUrl = result.secure_url;
        }

        // 2. Insert message
        await db.query(
            "INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message, attachment) VALUES ($1, $2, $3, $4, $5)",
            [ticketId, senderId, senderType, message, attachmentUrl]
        );

        res.status(200).json({ message: "Message sent." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send new message." });
    }
});

app.get("/closeticket", async (req,res) => {
    const { userId, ticketId } = req.query;
    try{
        const result = await db.query("UPDATE tickets SET status = $1 WHERE user_id = $2 AND id = $3", ["closed", userId, ticketId]);
        // send notification
        await db.query(
            "INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)",
            [userId, "Ticket Closed", "Your support ticket has been closed."]
        );
        res.status(200).json({message: "Ticket closed"});
    }catch(err){
        console.log(err)
        res.status(500).json({error: "Filed to close the ticket."})
    }
})


app.post("/notifications", async (req, res) => {
    const { userId, title, message } = req.body;
    try {
        await db.query(
            "INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)",
            [userId, title, message]
        );
        res.status(201).json({ message: "Notification created." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create notification." });
    }
});

app.get("/notifications", async (req, res) => {
    const userId = req.query.userId;
    try {
        const result = await db.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch notifications." });
    }
});

app.put("/notifications/:id/read", async (req, res) => {
    try {
        await db.query(
            "UPDATE notifications SET is_read = true WHERE id = $1",
            [req.params.id]
        );
        res.status(200).json({ message: "Notification marked as read." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update notification." });
    }
});


passport.use(
    "google",
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5050/auth/google/callback",
    }, async (accessToken, refreshToken, profile, cb) => {
        try {
            let user = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]);

            if (user.rows.length === 0) {
                const newUser = await db.query(
                    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
                    [profile.displayName, profile.email]
                );
                user = newUser;
            }

            return cb(null, user.rows[0]); // ✅ This becomes req.user
        } catch (err) {
            return cb(err, null);
        }
    })
);

app.listen(port, '0.0.0.0', () => console.log('Server running on port 5050'));
