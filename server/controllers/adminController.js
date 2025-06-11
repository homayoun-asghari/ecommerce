// server/controllers/adminController.js
import db from "../config/db.js";

// Get monthly order data for the chart
export const getMonthlyOrders = async (req, res) => {
    const { month, year } = req.query;

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
            WHERE DATE_PART('month', o.created_at) = $1
              AND DATE_PART('year', o.created_at) = $2
              AND o.status IN ('pending', 'delivered')
            GROUP BY day, o.status
            ORDER BY day;
        `, [month, year]);        

        res.status(200).json({
            daily: dailyStats.rows,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch seller's orders." });
    }
};

export const getOverview = async (req, res) => {
  try {
    // Get all required data in a single query
    const result = await db.query(`
      WITH date_series AS (
        SELECT 
          to_char(date_trunc('month', CURRENT_DATE - INTERVAL '5 months' + (n || ' months')::interval), 'YYYY-MM') as month
        FROM generate_series(0, 5) n
      ),
      monthly_orders AS (
        SELECT 
          to_char(date_trunc('month', o.created_at), 'YYYY-MM') as month,
          o.status,
          COUNT(o.id) as order_count,
          COALESCE(SUM(o.total), 0) as total_sales
        FROM orders o
        WHERE o.created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '5 months')
          AND o.status IN ('delivered', 'pending')
        GROUP BY to_char(date_trunc('month', o.created_at), 'YYYY-MM'), o.status
        ORDER BY month, status
      )
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'buyer') as total_buyers,
        (SELECT COUNT(*) FROM users WHERE role = 'seller') as total_sellers,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders) as total_revenue,
        (SELECT COUNT(*) FROM tickets) as pending_tickets,
        (SELECT COUNT(*) FROM reviews) as pending_reviews,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'month', month,
              'status', status,
              'count', order_count,
              'total_sales', total_sales
            )
          ) FROM monthly_orders),
          '[]'::json
        ) as monthly_orders
    `);

    const data = result.rows[0];

    // Prepare response
    const overview = {
      users: {
        total: Number(data.total_users) || 0,
        buyers: Number(data.total_buyers) || 0,
        sellers: Number(data.total_sellers) || 0
      },
      products: Number(data.total_products) || 0,
      orders: {
        total: Number(data.total_orders) || 0,
        revenue: Number(data.total_revenue) || 0
      },
      pending: {
        tickets: Number(data.pending_tickets) || 0,
        reviews: Number(data.pending_reviews) || 0
      },
      // Add monthly orders data for the chart
      ordersPerMonth: data.monthly_orders || [],
      revenueTrend: []
    };

    res.status(200).json(overview);
  } catch (err) {
    console.error('Error in getOverview:', err);
    res.status(500).json({ 
      error: 'Failed to fetch overview data',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};