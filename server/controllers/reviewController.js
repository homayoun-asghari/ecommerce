import db from "../config/db.js";

export const getReview = async (req, res) => {
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
}

export const getProductReview = async (req, res) => {
    const { userId, productId } = req.query;
    try {
        const result = await db.query(`SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2`, [productId, userId]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.log(err);
    }
}

export const updateReview = async (req, res) => {
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
}