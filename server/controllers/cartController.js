import db from "../config/db.js";

export const checkout = async (req, res) => {
    const { name, email, street, city, state, postal_code, country, phone, cart, shipping, password, confirmPassword } = req.body;
    const { shippingName, shippingStreet, shippingCity, shippingState, shippingPostal_code, shippingCountry, shippingPhone, } = req.body;
    let addressId = req.body.addressId;
    let userId = req.body.userId;
    let total = shipping === "flat" ? 15 : 0;

    for (const item of cart) {
        total += item.quantity * item.price;
    }

    try {
        // Check stock
        for (const item of cart) {
            const stockRes = await db.query("SELECT stock FROM products WHERE id = $1", [item.id]);
            const stock = stockRes.rows[0].stock;
            if (item.quantity > stock) {
                return res.status(200).json({ message: `Only ${stock} of ${item.name} left.` });
            }
        }

        // If creating account
        if (req.body.password && req.body.confirmPassword) {
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

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert the new user into the database
            const result = await db.query(`
                    INSERT INTO users (name, email, password, role)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id`, [name, email, hashedPassword, "buyer"]);
            userId = result.rows[0].id;
        }

        // add address 
        if (street) {
            if (!shippingStreet) {
                const add = await db.query("INSERT INTO addresses (user_id, full_name, street, city, state, postal_code, country, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id ", [userId, name, street, city, state, postal_code, country, phone]);
                addressId = add.rows[0].id;
            } else {
                const add = await db.query("INSERT INTO addresses (user_id, full_name, street, city, state, postal_code, country, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id ", [userId, shippingName, shippingStreet, shippingCity, shippingState, shippingPostal_code, shippingCountry, shippingPhone]);
                addressId = add.rows[0].id;
            }
        }

        // Create order
        const orderRes = await db.query(
            "INSERT INTO orders (buyer_id, status, total, address_id) VALUES ($1, $2, $3, $4) RETURNING id",
            [userId, "pending", total, addressId]
        );
        const orderId = orderRes.rows[0].id;

        // Insert items into order_items table
        for (const item of cart) {
            await db.query(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
                [orderId, item.id, item.quantity, item.price]
            );

            // Reduce stock
            await db.query(
                "UPDATE products SET stock = stock - $1 WHERE id = $2",
                [item.quantity, item.id]
            );
        }

        res.status(200).json({ message: "Now you are redirecting to payment page!" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to checkout" });
    }
}

export const updateDBCart = async (req, res) => {
    const { userId, cartItems } = req.body;

    try {
        const dbCartItems = await db.query("SELECT * FROM cart_items WHERE user_id = $1", [userId]);
        const dbItems = dbCartItems.rows;

        for (const item of cartItems) {
            await db.query(
                `INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, product_id)
                DO UPDATE SET quantity = EXCLUDED.quantity`,
                [userId, item.id, item.quantity]
            );
        }

        // Remove deleted items
        for (const dbItem of dbItems) {
            const stillExists = cartItems.some(item => item.id === dbItem.product_id);
            if (!stillExists) {
                await db.query(
                    "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
                    [userId, dbItem.product_id]
                );
            }
        }

        res.status(200).json({ message: "Cart updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update cart" });
    }
}

export const getDBCart = async (req, res) => {
    const { userId } = req.query;
    try {
        const result = await db.query("SELECT * FROM cart_items WHERE user_id = $1", [userId]);
        const dbCart = result.rows;
        res.status(200).json(dbCart);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch DB cart" });
    }
}