import db from "../config/db.js";

export const getOrders = async (req, res) => {
    const { userId, status } = req.query;

    try {
        const queryBase = `
            SELECT 
                o.id AS order_id,
                o.status,
                o.created_at,
                json_agg(json_build_object(
                    'product_id', p.id,
                    'name', p.name,
                    'price', p.price,
                    'image_url', p.image_url,
                    'quantity', oi.quantity,
                    'rating', r.rating,
                    'comment', r.comment
                )) AS products
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN reviews r ON p.id = r.product_id AND r.user_id = $1
            WHERE o.buyer_id = $1
            ${status ? "AND o.status = $2" : ""}
            GROUP BY o.id, o.status, o.created_at
            ORDER BY o.created_at DESC
            ${!status ? "LIMIT 10" : ""}
        `;

        const params = status ? [userId, status] : [userId];
        const result = await db.query(queryBase, params);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}

export const getSaleStats = async (req, res) => {
    const { userId, month, year } = req.query;

    try {
        // 1. Day-level breakdown (grouped by day and status)
        const dailyStats = await db.query(`
            SELECT 
                DATE_TRUNC('day', o.created_at) AS day,
                o.status,
                COUNT(DISTINCT o.id) AS order_count,
                SUM(oi.quantity * oi.price) AS total_sales
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE p.seller_id = $1
              AND DATE_PART('month', o.created_at) = $2
              AND DATE_PART('year', o.created_at) = $3
              AND o.status IN ('pending', 'delivered')
            GROUP BY day, o.status
            ORDER BY day;
        `, [userId, month, year]);

        // 2. Summary breakdown by status (lifetime)
        const summary = await db.query(`
            SELECT 
                o.status,
                COUNT(DISTINCT o.id) AS order_count,
                SUM(oi.quantity * oi.price) AS total_sales
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE p.seller_id = $1
            GROUP BY o.status;
        `, [userId]);

        res.status(200).json({
            daily: dailyStats.rows,
            summary: summary.rows,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch seller's orders." });
    }
};

export const getSellerOrders = async (req, res) => {
  const { userId } = req.query;

  try {
    const query = `
    SELECT 
      o.id AS order_id, 
      o.status, 
      o.created_at, 
      o.total, 
      u.name AS buyer_name,
      json_build_object(
        'street', a.street,
        'city', a.city,
        'state', a.state,
        'country', a.country,
        'postal_code', a.postal_code,
        'phone', a.phone
      ) AS shipping_address,
      json_agg(
        json_build_object(
          'product_id', p.id,
          'name', p.name,
          'price', oi.price,
          'quantity', oi.quantity,
          'image_url', p.image_url
        )
      ) AS order_items
    FROM orders o
    JOIN users u ON o.buyer_id = u.id
    JOIN addresses a ON o.address_id = a.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE p.seller_id = $1
    GROUP BY o.id, u.name, a.street, a.city, a.state, a.country, a.postal_code, a.phone
    ORDER BY o.created_at DESC
  `;
  



    const result = await db.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch seller orders' });
  }
};
