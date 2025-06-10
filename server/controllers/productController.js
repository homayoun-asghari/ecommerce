import db from "../config/db.js";

export const getProduct = async (req, res) => {
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
}

export const getNewArrivals = async (req, res) => {
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
};


export const getBestSellers = async (req, res) => {
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
}

export const getEspecialOffers = async (req, res) => {
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
}

export const getRelatedProducts = async (req, res) => {
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
}