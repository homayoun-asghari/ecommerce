import db from "../config/db.js";
import cloudinary from '../middlewares/cloudinary.js';

// controllers/productController.js
export const searchProducts = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        const searchTerm = `%${q}%`;
        const result = await db.query(`
            SELECT 
                p.*, 
                COALESCE(AVG(r.rating), 0) AS avg_rating,
                COUNT(r.id) AS review_count
            FROM products p
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.name ILIKE $1 OR p.description ILIKE $1
            GROUP BY p.id
            ORDER BY 
                CASE 
                    WHEN p.name ILIKE $1 THEN 1
                    WHEN p.description ILIKE $1 THEN 2
                    ELSE 3
                END,
                p.name
            LIMIT 10;
        `, [searchTerm]);

        res.status(200).json({
            products: result.rows.map(p => ({
                ...p,
                avg_rating: parseFloat(p.avg_rating),
                review_count: parseInt(p.review_count),
            }))
        });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Failed to perform search' });
    }
};


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

export const getSellersProducts = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const result = await db.query(`
            SELECT *
            FROM products
            WHERE seller_id = $1`, [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch sellers products" });
    }
}

export const addProduct = async (req, res) => {
    const { name, description, price, category, stock, seller_id } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !stock || !seller_id) {
        return res.status(400).json({
            error: "Missing required fields. Please provide name, description, price, category, stock, and seller_id"
        });
    }

    try {
        // Upload image to Cloudinary
        if (!req.file) {
            return res.status(400).json({ error: "Image is required" });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "products",
        });

        // Save product to database with Cloudinary URL
        const dbResult = await db.query(`
            INSERT INTO products (name, description, price, category, stock, image_url, seller_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [name, description, price, category, stock, result.secure_url, seller_id]
        );

        res.status(201).json({
            success: true,
            data: dbResult.rows[0]
        });
    } catch (err) {
        console.error('Error adding product:', err);
        // Send more specific error message
        if (err.code === '23505') { // PostgreSQL unique violation error code
            if (err.constraint === 'products_pkey') {
                res.status(400).json({ error: "Database error: ID conflict. Please try again." });
            } else {
                res.status(400).json({ error: "A product with this name already exists" });
            }
        } else if (err.message.includes('violates not-null constraint')) {
            res.status(400).json({ error: "All fields are required" });
        } else {
            res.status(500).json({ error: err.message || "Failed to add product" });
        }
    }
}