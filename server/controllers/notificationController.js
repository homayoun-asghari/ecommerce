import db from "../config/db.js";

export const addNotification = async (req, res) => {
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
}

export const getNotification = async (req, res) => {
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
}

export const updateNotification = async (req, res) => {
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
}