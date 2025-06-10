import db from "../config/db.js";

export const getAddress = async (req, res) => {
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
}

export const addAddress = async (req, res) => {
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
}

export const setDefaultAddress = async (req, res) => {
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
}

export const deleteAddress = async (req, res) => {
    const { addressId } = req.query;
    try {
        const result = await db.query("DELETE FROM addresses WHERE id = $1", [addressId]);
        res.status(200).json({ message: "Address deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete address" })
    }
}