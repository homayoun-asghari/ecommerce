// server/controllers/adminController.js
import db from "../config/db.js";

// Get all users with pagination and filtering
export const getUsers = async (req, res) => {
  try {
    const { 
      search = '', 
      role = 'all',
      page = 1, 
      limit = 10 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    // Add search condition
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
    }

    // Add role filter
    if (role && role !== 'all') {
      params.push(role);
      whereClause += ` AND role = $${params.length}`;
    }

    // Query to get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Query to get paginated users
    const usersQuery = `
      SELECT 
        id, name, email, role, 
        created_at as "createdAt",
        (SELECT COUNT(*) FROM orders WHERE buyer_id = users.id) as order_count
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const usersParams = [...params, parseInt(limit), offset];
    const usersResult = await db.query(usersQuery, usersParams);

    // Get unique roles for filter dropdown
    const rolesResult = await db.query('SELECT DISTINCT role FROM users');
    
    res.json({
      users: usersResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      filters: {
        roles: rolesResult.rows.map(r => r.role)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get total orders
    const ordersResult = await db.query(
      `SELECT COUNT(*) as order_count, COALESCE(SUM(total), 0) as total_spent 
       FROM orders 
       WHERE buyer_id = $1`,
      [id]
    );
    
    // Get total reviews
    const reviewsResult = await db.query(
      'SELECT COUNT(*) as review_count FROM reviews WHERE user_id = $1',
      [id]
    );
    
    res.json({
      orders: parseInt(ordersResult.rows[0]?.order_count) || 0,
      reviews: parseInt(reviewsResult.rows[0]?.review_count) || 0,
      totalSpent: parseFloat(ordersResult.rows[0]?.total_spent) || 0
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

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


export const getProducts = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    category,
    seller,
    status
  } = req.query;

  const offset = (page - 1) * limit;
  const params = [];
  let filterClause = '';

  // Search filter
  if (search.trim()) {
    params.push(`%${search.toLowerCase()}%`);
    filterClause += ` AND (LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`;
  }

  // Category filter
  if (category && category !== 'all') {
    params.push(category);
    filterClause += ` AND p.category = $${params.length}`;
  }

  // Seller filter
  if (seller && seller !== 'all') {
    params.push(seller);
    filterClause += ` AND p.seller_id = $${params.length}`;
  }

  // Status filter
  if (status && status !== 'all') {
    params.push(status);
    filterClause += ` AND p.status = $${params.length}`;
  }

  try {
    // Query products with seller name and review stats
    const productQuery = `
      SELECT 
        p.*, 
        u.name AS seller_name,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) AS review_count,
        (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) AS average_rating
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE 1=1 ${filterClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const productParams = [...params, parseInt(limit), parseInt(offset)];
    const productsResult = await db.query(productQuery, productParams);

    // Total count
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM products p
      WHERE 1=1 ${filterClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Categories for filter
    const categoriesResult = await db.query(`
      SELECT DISTINCT category FROM products WHERE category IS NOT NULL
    `);

    // Sellers for filter
    const sellersResult = await db.query(`
      SELECT DISTINCT u.id, u.name
      FROM users u
      JOIN products p ON p.seller_id = u.id
      WHERE u.role = 'seller'
    `);

    res.json({
      products: productsResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      filters: {
        categories: categoriesResult.rows.map(r => r.category).filter(Boolean),
        sellers: sellersResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};


export const getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT p.*, u.name AS seller_name,
              (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) AS review_count,
              (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) AS average_rating
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const result = await db.query(
      `UPDATE products 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: `Product ${status} successfully`,
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const checkResult = await db.query('SELECT * FROM products WHERE id = $1', [productId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await db.query('DELETE FROM products WHERE id = $1', [productId]);
    
    res.json({
      message: 'Product deleted successfully',
      productId
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
