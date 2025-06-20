import db from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

const saltRounds = 10;
export const register = async (req, res) => {
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
}

export const login = async (req, res) => {
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
}

export const forgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);

        if (result.rows.length > 0) {
            const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const link = `${process.env.FRONTEND_URL}/account?resetpassword=${token}`;
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
}

export const resetPassword = async (req, res) =>{
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
}

export const googleCallbackHandler = async (req, res) => {
    try {
        const roleCheck = await db.query(
            "SELECT role FROM users WHERE id = $1", [req.user.id]
        );
        const role = roleCheck.rows[0]?.role;

        const token = jwt.sign(
            { userId: req.user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        if (!role) {
            res.redirect(`${process.env.FRONTEND_URL}/account?id=${req.user.id}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/account?token=${token}`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("OAuth callback error");
    }
};