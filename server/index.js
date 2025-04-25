import express from 'express';
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import cors from "cors";

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
const port = 5050;

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/products/newarrivals", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM products 
            ORDER BY created_at DESC 
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
        const products = [];
        const result = await db.query(`
            SELECT p.id AS product_id, 
                   p.name AS product_name, 
                   SUM(oi.quantity) AS total_quantity_sold
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            GROUP BY p.id, p.name
            ORDER BY total_quantity_sold DESC
            LIMIT 10;
          `);
        for (let i = 0; i < result.rows.length; i++) {
            const productResult = await db.query("SELECT * FROM products WHERE id = $1", [result.rows[i].product_id]);
            products.push(productResult.rows[0]);
        }
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch new arrivals" });
    }
});

app.get("/products/especialoffers", async (req, res) => {
    const discount = parseFloat(req.query.discount);
    try {
        const products = [];
        const result = await db.query(`
            SELECT * 
            FROM products
            WHERE discount > $1
            ORDER BY discount DESC
            LIMIT 10;
          `, [discount]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch new arrivals" });
    }
});



app.listen(port, '0.0.0.0', () => console.log('Server running on port 5050'));
