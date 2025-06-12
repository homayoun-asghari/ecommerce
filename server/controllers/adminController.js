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

// Get all orders with pagination and filtering
export const getOrders = async (req, res) => {
  try {
    const { 
      status = 'all',
      search = '',
      page = 1, 
      limit = 10,
      sort = 'newest'
    } = req.query;
    
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';
    let orderBy = 'o.created_at DESC';

    // Add status filter
    if (status && status !== 'all') {
      params.push(status);
      whereClause += ` AND o.status = $${params.length}`;
    }

    // Add search filter
    if (search) {
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      whereClause += ` AND (
        o.id::TEXT LIKE $${params.length - 2} OR 
        LOWER(buyer.name) LIKE LOWER($${params.length - 1}) OR
        LOWER(seller.name) LIKE LOWER($${params.length})
      )`;
    }

    // Set sort order
    if (sort === 'oldest') {
      orderBy = 'o.created_at ASC';
    } else if (sort === 'price_asc') {
      orderBy = 'o.total ASC';
    } else if (sort === 'price_desc') {
      orderBy = 'o.total DESC';
    }

    // Query to get total count
    const countQuery = `
      SELECT COUNT(DISTINCT o.id) as total 
      FROM orders o
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN users seller ON p.seller_id = seller.id
      ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Main query to get paginated orders
    const ordersQuery = `
      SELECT 
        o.id,
        o.status,
        o.total,
        o.created_at as "createdAt",
        COUNT(oi.id) as item_count,
        json_build_object(
          'id', buyer.id,
          'name', buyer.name,
          'email', buyer.email
        ) as buyer,
        json_build_object(
          'id', seller.id,
          'name', seller.name,
          'email', seller.email
        ) as seller
      FROM orders o
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN users seller ON p.seller_id = seller.id
      ${whereClause}
      GROUP BY o.id, buyer.id, seller.id
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const ordersParams = [...params, parseInt(limit), offset];
    const ordersResult = await db.query(ordersQuery, ordersParams);

    // Get unique statuses for filter dropdown
    const statusesResult = await db.query('SELECT DISTINCT status FROM orders');
    
    res.json({
      orders: ordersResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      filters: {
        statuses: statusesResult.rows.map(r => r.status)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get order details by ID
export const getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // Get order header info
    const orderQuery = `
      SELECT 
        o.*,
        json_build_object(
          'id', buyer.id,
          'name', buyer.name,
          'email', buyer.email
        ) as buyer,
        json_build_object(
          'id', a.id,
          'fullName', a.full_name,
          'street', a.street,
          'city', a.city,
          'state', a.state,
          'postalCode', a.postal_code,
          'country', a.country,
          'phone', a.phone
        ) as shipping_address
      FROM orders o
      JOIN users buyer ON o.buyer_id = buyer.id
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.id = $1
    `;
    
    const orderResult = await db.query(orderQuery, [id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items with product and seller info
    const itemsQuery = `
      SELECT 
        oi.id,
        oi.quantity,
        oi.price,
        p.id as product_id,
        p.name as product_name,
        p.image_url as product_image,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'email', s.email
        ) as seller
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN users s ON p.seller_id = s.id
      WHERE oi.order_id = $1
    `;
    
    const itemsResult = await db.query(itemsQuery, [id]);
    
    // Get payment info if available
    let paymentInfo = null;
    try {
      // First check if payment table exists
      const tableCheck = await db.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE  table_schema = 'public'
          AND    table_name   = 'payments'
        )`
      );
      
      if (tableCheck.rows[0].exists) {
        const paymentQuery = 'SELECT * FROM payments WHERE order_id = $1';
        const paymentResult = await db.query(paymentQuery, [id]);
        if (paymentResult.rows.length > 0) {
          paymentInfo = paymentResult.rows[0];
        }
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
      // Continue without payment info if there's an error
    }
    
    res.json({
      ...order,
      items: itemsResult.rows,
      payment: paymentInfo
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  
  try {
    // Check if order exists
    const orderCheck = await db.query('SELECT id FROM orders WHERE id = $1', [id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order status
    const updateQuery = `
      UPDATE orders 
      SET status = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [status, id]);
    
    // TODO: Add order status change notification
    
    res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Get all payments with filtering and pagination
export const getPayments = async (req, res) => {
  try {
    const { 
      seller_id,
      status,
      start_date,
      end_date,
      search = '',
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';
    let joinClause = 'LEFT JOIN users buyer ON payments.buyer_id = buyer.id';
    
    // Add filters
    if (seller_id) {
      params.push(seller_id);
      whereClause += ` AND payments.buyer_id = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      whereClause += ` AND payments.status = $${params.length}`;
    }
    
    if (start_date) {
      params.push(start_date);
      whereClause += ` AND payments.created_at >= $${params.length}::date`;
    }
    
    if (end_date) {
      params.push(end_date);
      whereClause += ` AND payments.created_at <= ($${params.length}::date + '1 day'::interval)`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (
        payments.id::TEXT ILIKE $${params.length} OR
        payments.order_id::TEXT ILIKE $${params.length} OR
        buyer.name ILIKE $${params.length}
      )`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT payments.id) as total 
      FROM payments
      ${joinClause}
      ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const paymentsQuery = `
      SELECT 
        payments.id,
        payments.order_id as "orderId",
        payments.amount,
        payments.status,
        payments.method,
        payments.paid_at as "paidAt",
        payments.created_at as "createdAt",
        json_build_object(
          'id', buyer.id,
          'name', buyer.name,
          'email', buyer.email
        ) as buyer
      FROM payments
      ${joinClause}
      ${whereClause}
      ORDER BY payments.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const paymentsParams = [...params, parseInt(limit), offset];
    const paymentsResult = await db.query(paymentsQuery, paymentsParams);

    // Get available sellers for filter
    const sellersQuery = `
      SELECT DISTINCT u.id, u.name 
      FROM users u
      JOIN payments p ON u.id = p.buyer_id
      ORDER BY u.name
    `;
    const sellersResult = await db.query(sellersQuery);

    res.json({
      payments: paymentsResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      filters: {
        sellers: sellersResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Get payment details by ID
export const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentQuery = `
      SELECT 
        p.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as seller,
        json_build_object(
          'id', o.id,
          'status', o.status,
          'total', o.total,
          'created_at', o.created_at
        ) as order_info
      FROM payments p
      LEFT JOIN users u ON p.buyer_id = u.id
      LEFT JOIN orders o ON p.order_id = o.id
      WHERE p.id = $1
    `;
    
    const paymentResult = await db.query(paymentQuery, [id]);
    
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(paymentResult.rows[0]);
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
};

// Process a payout to a seller
export const processPayout = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Start a transaction
    await db.query('BEGIN');
    
    // Get the payment with FOR UPDATE to lock the row
    const getPaymentQuery = `
      SELECT * FROM payments 
      WHERE id = $1 
      FOR UPDATE
    `;
    const paymentResult = await db.query(getPaymentQuery, [id]);
    
    if (paymentResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const payment = paymentResult.rows[0];
    
    // Check if payment is already processed
    if (payment.status === 'paid') {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Payment already processed' });
    }
    
    // Update payment status
    const updatePaymentQuery = `
      UPDATE payments 
      SET status = 'paid', 
          paid_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const updatedPayment = await db.query(updatePaymentQuery, [id]);
    
    // Create a payout record (assuming we have a payouts table)
    const createPayoutQuery = `
      INSERT INTO payouts (
        payment_id, 
        seller_id, 
        amount, 
        status
      ) VALUES ($1, $2, $3, 'completed')
      RETURNING *
    `;
    
    const payoutParams = [
      id,
      payment.seller_id,
      payment.amount
    ];
    
    const payoutResult = await db.query(createPayoutQuery, payoutParams);
    
    // Commit the transaction
    await db.query('COMMIT');
    
    res.json({
      message: 'Payout processed successfully',
      payment: updatedPayment.rows[0],
      payout: payoutResult.rows[0]
    });
    
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error processing payout:', error);
    res.status(500).json({ error: 'Failed to process payout' });
  }
};

// Update payout status
export const updatePayoutStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    // Validate status
    if (!['pending', 'paid', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const query = `
      UPDATE payouts 
      SET status = $1, 
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payout not found' });
    }
    
    res.json({
      message: 'Payout status updated successfully',
      payout: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating payout status:', error);
    res.status(500).json({ error: 'Failed to update payout status' });
  }
};

// Get payouts with filtering
export const getPayouts = async (req, res) => {
  try {
    const { 
      seller_id,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';
    
    // Add filters
    if (seller_id) {
      params.push(seller_id);
      whereClause += ` AND p.seller_id = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      whereClause += ` AND p.status = $${params.length}`;
    }
    
    if (start_date) {
      params.push(start_date);
      whereClause += ` AND p.created_at >= $${params.length}::date`;
    }
    
    if (end_date) {
      params.push(end_date);
      whereClause += ` AND p.created_at <= ($${params.length}::date + '1 day'::interval)`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM payouts p
      ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const payoutsQuery = `
      SELECT 
        p.id,
        p.payment_id as "paymentId",
        p.amount,
        p.status,
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as seller
      FROM payouts p
      LEFT JOIN users u ON p.seller_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const payoutsParams = [...params, parseInt(limit), offset];
    const payoutsResult = await db.query(payoutsQuery, payoutsParams);

    res.json({
      payouts: payoutsResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
};
