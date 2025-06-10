import db from "../config/db.js";

export const updateUser = async (req, res) => {

    try {
        if (req.body.name) {
            const result = await db.query(`
                UPDATE users SET name = $1 WHERE id = $2`, [req.body.name, req.body.id]);
        }

        if (req.body.email) {
            const result = await db.query(`
                UPDATE users SET email = $1 WHERE id = $2`, [req.body.email, req.body.id]);
        }

        if (req.body.password || req.body.confirmPassword) {
            // Check if passwords match
            if (req.body.password !== req.body.confirmPassword) {
                return res.status(400).json({ error: "Passwords do not match" });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            const result = await db.query(`
                UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, req.body.id]);
        }

        res.status(201).json({ message: "User updated" });


    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to register user" });
    }
}

export const updateRole = async (req, res) => {
    const id = req.query.id;
    let role;

    if (req.body.role === "customer") {
        role = "buyer";
    } else {
        role = "seller";
    }
    try {
        await db.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, id]);
        const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getAccountDetails = async (req, res) => {
    try {
        const id = req.user.userId;
        const result = await db.query(
            `SELECT id, name, email, role FROM users WHERE id = $1`,
            [id]
        );
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch account details" });
    }
};