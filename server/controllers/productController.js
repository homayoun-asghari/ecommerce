import db from "../config/db.js";
import cloudinary from '../middlewares/cloudinary.js';

// controllers/productController.js
export const searchProducts = async (req, res) => {
    const { q, sort = 'relevance' } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        // First try exact match, then partial match
        const exactMatchTerm = q.trim();
        const partialMatchTerm = `%${exactMatchTerm}%`;

        const result = await db.query(`
            SELECT 
                p.*, 
                COALESCE(AVG(r.rating), 0) AS avg_rating,
                COUNT(DISTINCT r.id) AS review_count,
                COALESCE(SUM(oi.quantity), 0) AS total_quantity_sold,
                -- Add a relevance score to prioritize matches
                CASE 
                    WHEN p.name ILIKE $1 THEN 1  -- Exact match
                    WHEN p.name ILIKE $2 THEN 2  -- Starts with
                    WHEN p.name ILIKE $3 OR p.description ILIKE $3 THEN 3  -- Contains in name or description
                    ELSE 4
                END as relevance
            FROM products p
            LEFT JOIN reviews r ON p.id = r.product_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            WHERE p.name ILIKE $3 OR p.description ILIKE $3
            GROUP BY p.id
            ORDER BY 
                ${sort === 'best-sellers' ? 'total_quantity_sold DESC' : 'relevance, p.name'}
            LIMIT 10;
        `, [exactMatchTerm, `${exactMatchTerm}%`, partialMatchTerm]);

        res.status(200).json({
            products: result.rows.map(p => ({
                ...p,
                avg_rating: parseFloat(p.avg_rating),
                review_count: parseInt(p.review_count),
                total_quantity_sold: parseInt(p.total_quantity_sold) || 0
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
    COALESCE(SUM(oi.quantity), 0) AS total_quantity_sold,
    COALESCE(AVG(r.rating), 0) AS avg_rating, 
    COUNT(DISTINCT r.id) AS review_count
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.price, p.description, p.image_url, p.category, p.stock, p.created_at, p.updated_at
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
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
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

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, stock, discount } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || stock === undefined) {
        return res.status(400).json({
            error: "Missing required fields. Please provide name, description, price, category, and stock"
        });
    }

    try {
        // Check if product exists
        const productCheck = await db.query('SELECT * FROM products WHERE id = $1', [id]);

        if (productCheck.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        let imageUrl = productCheck.rows[0].image_url;

        // If a new image was uploaded
        if (req.file) {
            // Upload new image to Cloudinary
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "products",
            });
            imageUrl = result.secure_url;

            // Optionally delete the old image from Cloudinary
            // This requires parsing the public_id from the URL
        }

        // Update product in database
        const updateResult = await db.query(
            `UPDATE products 
             SET name = $1, description = $2, price = $3, category = $4, 
                 stock = $5, image_url = $6, discount = $7, updated_at = NOW()
             WHERE id = $8
             RETURNING *`,
            [
                name,
                description,
                price,
                category,
                stock,
                imageUrl,
                discount || null,
                id
            ]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: "Failed to update product" });
        }

        res.status(200).json(updateResult.rows[0]);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: "Failed to update product" });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if product exists
        const productCheck = await db.query('SELECT * FROM products WHERE id = $1', [id]);

        if (productCheck.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Delete from database
        await db.query('DELETE FROM products WHERE id = $1', [id]);

        // Optionally delete the image from Cloudinary
        // This requires parsing the public_id from the URL

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: "Failed to delete product" });
    }
};

export const getShopProducts = async (req, res) => {
    const {
        category,
        minPrice,
        maxPrice,
        minRating,
        sort = 'featured',
        page = 1,
        limit = 12
    } = req.query;

    console.log('Shop products query:', { category, minPrice, maxPrice, minRating, sort, page, limit });

    // Define query and params at the function scope
    let query = '';
    const params = [];
    let paramIndex = 1;

    try {
        // Base query
        query = `
            SELECT 
                p.*, 
                COALESCE(AVG(r.rating), 0) AS avg_rating,
                COUNT(r.id) AS review_count,
                COALESCE(SUM(oi.quantity), 0) AS total_quantity_sold,
                COUNT(*) OVER() AS total_count
            FROM products p
            LEFT JOIN reviews r ON p.id = r.product_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
        `;

        // WHERE conditions
        const conditions = [];

        if (category) {
            conditions.push(`p.category = $${paramIndex++}`);
            params.push(category);
        }

        if (minPrice) {
            conditions.push(`p.price >= $${paramIndex++}`);
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            conditions.push(`p.price <= $${paramIndex++}`);
            params.push(parseFloat(maxPrice));
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        // GROUP BY for aggregate functions
        query += ` GROUP BY p.id`;

        // HAVING for rating filter (after GROUP BY)
        if (minRating) {
            query += ` HAVING COALESCE(AVG(r.rating), 0) >= $${paramIndex++}`;
            params.push(parseFloat(minRating));
        }

        // ORDER BY based on sort parameter
        switch (sort) {
            case 'price-low':
                query += ` ORDER BY p.price ASC`;
                break;
            case 'price-high':
                query += ` ORDER BY p.price DESC`;
                break;
            case 'rating':
                query += ` ORDER BY avg_rating DESC`;
                break;
            case 'newest':
            case 'best-sellers':
            case 'sold':
                query += ` ORDER BY total_quantity_sold DESC`;
                break;
            case 'featured': // For now, treat 'featured' same as 'newest' since we don't have a featured column
            default:
                query += ` ORDER BY p.created_at DESC`;
        }

        // Add pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(parseInt(limit), offset);

        console.log('Executing query:', query);
        console.log('With params:', params);

        const result = await db.query(query, params);
        console.log('Query result rows:', result.rows.length);

        // Get total count from the first row (if any)
        const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
        const totalPages = Math.ceil(totalCount / limit);

        const responseData = {
            products: result.rows.map(p => {
                const product = {
                    ...p,
                    avg_rating: parseFloat(p.avg_rating),
                    review_count: parseInt(p.review_count)
                };
                delete product.total_count; // Remove the total_count from each product
                return product;
            }),
            pagination: {
                total: totalCount,
                total_pages: totalPages,
                current_page: parseInt(page),
                per_page: parseInt(limit)
            }
        };

        console.log('Sending response with', responseData.products.length, 'products');
        res.status(200).json(responseData);
    } catch (err) {
        // Use the query and params that were in scope when the error occurred
        console.error('Error in getShopProducts:', {
            message: err.message,
            stack: err.stack,
            query: query || 'Query not available',
            params: params || []
        });

        res.status(500).json({
            error: 'Failed to fetch products',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export default {
    searchProducts,
    getProduct,
    getNewArrivals,
    getBestSellers,
    getEspecialOffers,
    getRelatedProducts,
    getSellersProducts,
    addProduct,
    getShopProducts
};