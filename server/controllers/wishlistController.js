import db from "../config/db.js";

export const getWhishlist = async (req, res) => {
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
}

export const addToWishlist = async (req, res) => {
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
}

export const removeFromWishlist = async (req, res) => {
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
}