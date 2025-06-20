import db from "../config/db.js";

export const getPayment = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Get all payments for the seller with order and product details
    const query = `
      SELECT 
        p.id AS payment_id,
        p.amount,
        p.status AS payment_status,
        p.method AS payment_method,
        p.paid_at,
        p.created_at,
        o.id AS order_id,
        o.status AS order_status,
        o.total AS order_total,
        o.created_at AS order_created_at,
        json_agg(
          json_build_object(
            'product_id', oi.product_id,
            'product_name', prd.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.quantity * oi.price,
            'seller_id', prd.seller_id
          )
        ) AS order_items
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products prd ON oi.product_id = prd.id
      WHERE prd.seller_id = $1
      GROUP BY 
        p.id, p.amount, p.status, p.method, p.paid_at, p.created_at,
        o.id, o.status, o.total, o.created_at
      ORDER BY p.created_at DESC;
    `;


    const result = await db.query(query, [userId]);
    
    // Format the response to match what the frontend expects
    const formattedPayments = result.rows.map(row => ({
      id: row.payment_id,
      order_id: row.order_id,
      amount: row.amount,
      status: row.payment_status,
      method: row.payment_method,
      paid_at: row.paid_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      order_status: row.order_status,
      order_total: row.order_total,
      order_created_at: row.order_created_at,
      items: row.order_items
    }));
    
    res.status(200).json(formattedPayments);
  } catch (err) {
    console.error('Error fetching seller payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
};