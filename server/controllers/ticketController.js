import db from "../config/db.js";
import cloudinary from "../middlewares/cloudinary.js";

export const getTicket = async (req, res) => {
    const { userId, status } = req.query;
    try {
        const result = await db.query("SELECT * FROM tickets WHERE user_id = $1 AND status = $2", [userId, status]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch tickets." })
    }
}

export const getTicketMessage = async (req, res) => {
    const { ticketId } = req.query;
    try {
        const result = await db.query("SELECT * FROM ticket_messages WHERE ticket_id = $1", [ticketId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch messages." })
    }
}

export const addTicket = async (req, res) => {
    const { userId, userRole, category, subject, order_id, message } = req.body;
    let attachmentUrl = null;

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
}

export const addTicketMessage = async (req, res) => {
    const { message, ticketId, senderId, senderType } = req.body;
    let attachmentUrl = null;

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
}

export const closeTicket = async (req, res) =>{
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
}