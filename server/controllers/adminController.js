// server/controllers/adminController.js
import db from "../config/db.js";

// Message Management
export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get paginated messages
    const messages = await db.query(
      `SELECT * FROM contacts 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count for pagination
    const total = await db.query(
      'SELECT COUNT(*) FROM contacts'
    );

    res.json({
      data: messages.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

export const replyToMessage = async (req, res) => {
  try {
    const { messageId, reply, adminId } = req.body;
    
    if (!messageId || !reply) {
      return res.status(400).json({ message: 'Message ID and reply are required' });
    }

    // Update the message with the reply and admin ID
    const result = await db.query(
      `UPDATE contacts 
       SET response_text = $1, status = 'resolved', 
           responded_at = NOW(), responded_by = $3 
       WHERE id = $2 
       RETURNING *`,
      [reply, messageId, adminId || 1] // Default to admin ID 1 if not provided
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Reply sent successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({ message: 'Error sending reply' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM contacts WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message' });
  }
};

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
// Get all tickets with filtering and pagination
export const getTickets = async (req, res) => {
  try {
    const { 
      status = 'all',
      category = 'all',
      search = '',
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';
    let joinClause = 'LEFT JOIN users u ON t.user_id = u.id';

    // Add filters
    if (status && status !== 'all') {
      params.push(status);
      whereClause += ` AND t.status = $${params.length}`;
    }

    if (category && category !== 'all') {
      params.push(category);
      whereClause += ` AND t.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (
        t.subject ILIKE $${params.length} OR
        t.id::TEXT ILIKE $${params.length} OR
        u.name ILIKE $${params.length} OR
        u.email ILIKE $${params.length}
      )`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tickets t
      ${joinClause}
      ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated tickets
    const ticketsQuery = `
      SELECT 
        t.id, t.subject, t.category, t.status, 
        t.created_at as "createdAt", t.updated_at as "updatedAt",
        t.order_id as "orderId",
        u.id as "userId", u.name as "userName", u.email as "userEmail"
      FROM tickets t
      ${joinClause}
      ${whereClause}
      ORDER BY t.updated_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const ticketsParams = [...params, parseInt(limit), offset];
    const ticketsResult = await db.query(ticketsQuery, ticketsParams);

    // Get ticket messages count for each ticket
    const ticketIds = ticketsResult.rows.map(t => t.id);
    let messagesCount = {};
    if (ticketIds.length > 0) {
      const messagesQuery = `
        SELECT ticket_id, COUNT(*) as count 
        FROM ticket_messages 
        WHERE ticket_id = ANY($1)
        GROUP BY ticket_id
      `;
      const messagesResult = await db.query(messagesQuery, [ticketIds]);
      messagesCount = messagesResult.rows.reduce((acc, row) => {
        acc[row.ticket_id] = row.count;
        return acc;
      }, {});
    }

    // Format response
    const tickets = ticketsResult.rows.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      orderId: ticket.orderId,
      user: {
        id: ticket.userId,
        name: ticket.userName,
        email: ticket.userEmail
      },
      messageCount: messagesCount[ticket.id] || 0
    }));

    res.json({
      data: tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// Get ticket details with messages
export const getTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get ticket info
    const ticketQuery = `
      SELECT 
        t.*, 
        u.name as "userName", 
        u.email as "userEmail"
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `;
    
    const ticketResult = await db.query(ticketQuery, [id]);
    
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    // Get ticket messages
    const messagesQuery = `
      SELECT 
        tm.*,
        u.name as "senderName",
        u.role as "senderRole"
      FROM ticket_messages tm
      LEFT JOIN users u ON tm.sender_id = u.id
      WHERE tm.ticket_id = $1
      ORDER BY tm.created_at ASC
    `;
    
    const messagesResult = await db.query(messagesQuery, [id]);

    // Format response
    const response = {
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      orderId: ticket.order_id,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      user: {
        id: ticket.user_id,
        name: ticket.userName,
        email: ticket.userEmail,
        role: ticket.user_role
      },
      messages: messagesResult.rows.map(msg => ({
        id: msg.id,
        message: msg.message,
        attachment: msg.attachment,
        createdAt: msg.created_at,
        sender: {
          id: msg.sender_id,
          name: msg.senderName || 'System',
          role: msg.sender_type || 'system',
          isAdmin: msg.sender_type === 'admin'
        }
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
};

// Update ticket status
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Map old status values to new ones for backward compatibility
    const statusMap = {
      'in_progress': 'pending',
      'waiting': 'pending',
      'pending': 'pending',
      'resolved': 'resolved',
      'closed': 'closed',
      'open': 'open'
    };

    const newStatus = statusMap[status] || 'open';

    const query = `
      UPDATE tickets 
      SET status = $1, 
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [newStatus, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      message: 'Ticket status updated successfully',
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ 
      error: 'Failed to update ticket status',
      details: error.message 
    });
  }
};

// Add response to ticket
export const addTicketResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, adminId = 1, adminName = 'Admin' } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Start transaction
    await db.query('BEGIN');

    try {
      // Add message
      const messageQuery = `
        INSERT INTO ticket_messages 
          (ticket_id, sender_id, sender_type, message, created_at)
        VALUES ($1, $2, 'admin', $3, NOW())
        RETURNING *
      `;
      
      const messageResult = await db.query(messageQuery, [
        id, 
        adminId,
        message
      ]);
      
      // Update ticket status to in_progress if it was closed
      await db.query(
        `UPDATE tickets 
         SET status = 'in_progress', updated_at = NOW() 
         WHERE id = $1 AND status = 'closed'`,
        [id]
      );

      // Update ticket's updated_at
      await db.query(
        'UPDATE tickets SET updated_at = NOW() WHERE id = $1',
        [id]
      );

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Response added successfully',
        response: {
          ...messageResult.rows[0],
          sender_name: adminName // Ensure sender_name is included in response
        }
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Database error in addTicketResponse:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in addTicketResponse:', error);
    res.status(500).json({ error: 'Failed to add response', details: error.message });
  }
};

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

// Get all reviews with filtering and pagination
export const getReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      rating,
      search = ''
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    // Add rating filter
    if (rating) {
      params.push(parseInt(rating));
      whereClause += ` AND r.rating = $${params.length}`;
    }

    // Add search filter
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (
        p.name ILIKE $${params.length} OR 
        u.name ILIKE $${params.length} OR
        u.email ILIKE $${params.length} OR
        r.comment ILIKE $${params.length}
      )`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated reviews with user and product info
    const reviewsQuery = `
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        p.id as product_id, p.name as product_name,
        u.id as user_id, u.name as user_name, u.email as user_email
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const reviewsParams = [...params, parseInt(limit), offset];
    const reviewsResult = await db.query(reviewsQuery, reviewsParams);

    // Format the response
    const reviews = reviewsResult.rows.map(row => ({
      id: row.id,
      rating: parseFloat(row.rating),
      comment: row.comment,
      created_at: row.created_at,
      product: {
        id: row.product_id,
        name: row.product_name
      },
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email
      }
    }));

    res.json({
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if review exists
    const checkQuery = 'SELECT id FROM reviews WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Delete the review
    const deleteQuery = 'DELETE FROM reviews WHERE id = $1 RETURNING *';
    await db.query(deleteQuery, [id]);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Get all notifications with filtering and pagination
export const getNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      status = '',
      search = ''
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';
    let joinClause = 'LEFT JOIN users u ON n.user_id = u.id';

    // Add status filter
    if (status === 'read') {
      whereClause += ' AND n.is_read = true';
    } else if (status === 'unread') {
      whereClause += ' AND n.is_read = false';
    }

    // Add search filter
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (
        n.title ILIKE $${params.length} OR 
        n.message ILIKE $${params.length} OR
        u.name ILIKE $${params.length} OR
        u.email ILIKE $${params.length}
      )`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM notifications n
      ${joinClause}
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated notifications with user info
    const notificationsQuery = `
      SELECT 
        n.id, n.title, n.message, n.is_read, n.created_at,
        n.user_id,
        u.name as user_name, u.email as user_email
      FROM notifications n
      ${joinClause}
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const notificationsParams = [...params, parseInt(limit), offset];
    const notificationsResult = await db.query(notificationsQuery, notificationsParams);

    // Format the response
    const notifications = notificationsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      message: row.message,
      is_read: row.is_read,
      created_at: row.created_at,
      user_id: row.user_id,
      user_name: row.user_name,
      user_email: row.user_email
    }));

    res.json({
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};
export const createNotification = async (req, res) => {
  const { title, message, userIds = [] } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  try {
    // For global notification
    if (!userIds.length) {
      const query = `
        INSERT INTO notifications (title, message, is_read, user_id, created_at)
        VALUES ($1, $2, false, NULL, NOW())
        RETURNING *
      `;
      const result = await db.query(query, [title, message]);
      return res.status(201).json({
        message: 'Global notification created',
        notification: result.rows[0]
      });
    }
    
    // For specific users
    const notifications = [];
    for (const userId of userIds) {
      if (!userId) continue;
      
      const query = `
        INSERT INTO notifications (title, message, is_read, user_id, created_at)
        VALUES ($1, $2, false, $3, NOW())
        RETURNING *
      `;
      const result = await db.query(query, [title, message, userId]);
      notifications.push(result.rows[0]);
    }
    
    res.status(201).json({
      message: 'Notifications created successfully',
      notifications
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create notifications' });
  }
};

// Update notification status (read/unread)
export const updateNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const query = `
      UPDATE notifications 
      SET is_read = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [isRead, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      message: 'Notification status updated successfully',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating notification status:', error);
    res.status(500).json({ error: 'Failed to update notification status' });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification exists
    const checkQuery = 'SELECT id FROM notifications WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Delete the notification
    const deleteQuery = 'DELETE FROM notifications WHERE id = $1 RETURNING *';
    await db.query(deleteQuery, [id]);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Mark multiple notifications as read
export const markNotificationsAsRead = async (req, res) => {
  const { notificationIds } = req.body;
  
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({ error: 'No notification IDs provided' });
  }

  try {
    const query = `
      UPDATE notifications 
      SET is_read = true 
      WHERE id = ANY($1::int[])
      RETURNING *
    `;
    
    const result = await db.query(query, [notificationIds]);
    
    res.json({
      message: 'Notifications marked as read',
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};

// Delete multiple notifications
export const deleteNotificationsBatch = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No notification IDs provided' });
    }
    
    await client.query('BEGIN');
    
    const query = 'DELETE FROM notifications WHERE id = ANY($1::int[])';
    await client.query(query, [ids]);
    
    await client.query('COMMIT');
    
    res.json({ message: 'Notifications deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting notifications batch:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  } finally {
    client.release();
  }
};

// Blog Management

// Get all blog posts with pagination or a single post by ID
export const getBlogPosts = async (req, res) => {
  try {
    const { id, author_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // If ID is provided, fetch a single post
    if (id) {
      const query = `
        SELECT b.*, u.name as author_name 
        FROM blog b
        LEFT JOIN users u ON b.author_id = u.id
        WHERE b.id = $1
      `;
      
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      
      return res.json(result.rows[0]);
    }
    
    // If author_id is provided, fetch posts by author
    let whereClause = '';
    const queryParams = [];
    
    if (author_id) {
      whereClause = 'WHERE b.author_id = $1';
      queryParams.push(author_id);
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM blog b ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);
    
    // Get paginated posts with author names
    const query = `
      SELECT b.*, u.name as author_name 
      FROM blog b
      LEFT JOIN users u ON b.author_id = u.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    const result = await db.query(query, [...queryParams, limit, offset]);
    
    res.json({
      posts: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts', details: error.message });
  }
};

// Create a new blog post
export const createBlogPost = async (req, res) => {
  try {
    const { title, content, image_url } = req.body;
    const author_id = req.user?.id; // Assuming user is authenticated and user info is in req.user
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const query = `
      INSERT INTO blog (title, content, image_url, author_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await db.query(query, [title, content, image_url || null, author_id || null]);
    
    res.status(201).json({
      message: 'Blog post created successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
};

// Update a blog post
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image_url } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Check if post exists
    const checkQuery = 'SELECT id FROM blog WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    const query = `
      UPDATE blog 
      SET title = $1, content = $2, image_url = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await db.query(query, [title, content, image_url || null, id]);
    
    res.json({
      message: 'Blog post updated successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
};

// Delete a blog post
export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if post exists
    const checkQuery = 'SELECT id FROM blog WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Delete the post
    const deleteQuery = 'DELETE FROM blog WHERE id = $1';
    await db.query(deleteQuery, [id]);
    
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
};

// Settings Management

// Get all settings
export const getSettings = async (req, res) => {
  try {
    const query = 'SELECT * FROM settings';
    const result = await db.query(query);
    
    // Transform array of settings into an object
    const settings = result.rows.reduce((acc, { key, value }) => {
      try {
        // Try to parse JSON values
        acc[key] = JSON.parse(value);
      } catch (e) {
        // If not valid JSON, use as is
        acc[key] = value;
      }
      return acc;
    }, {});
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const settings = req.body; // Array of { key, value } objects
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: 'Settings must be an array of { key, value } objects' });
    }
    
    // Start a transaction
    await db.query('BEGIN');
    
    // Update each setting
    for (const { key, value } of settings) {
      const query = `
        INSERT INTO settings (key, value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = EXCLUDED.value,
          updated_at = NOW()
        RETURNING *
      `;
      
      // Stringify if value is an object or array
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();
      
      await db.query(query, [key, settingValue]);
    }
    
    await db.query('COMMIT');
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings', details: error.message });
  }
};

// Get all documents
export const getDocuments = async (req, res) => {
  try {
    const query = 'SELECT * FROM documents';
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// Create or update document
export const saveDocument = async (req, res) => {
  try {
    const { type, content } = req.body;
    
    if (!type || content === undefined) {
      return res.status(400).json({ error: 'Type and content are required' });
    }
    
    await db.query('BEGIN');
    
    const query = `
      INSERT INTO documents (type, content, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (type) 
      DO UPDATE SET 
        content = EXCLUDED.content,
        updated_at = NOW()
      RETURNING *
    `;
    
    const result = await db.query(query, [type, content]);
    
    await db.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Failed to save document', details: error.message });
  }
};

// Update email template
export const updateEmailTemplate = async (req, res) => {
  try {
    const { template, subject, content } = req.body;
    
    if (!template || !subject || content === undefined) {
      return res.status(400).json({ error: 'Template, subject and content are required' });
    }
    
    await db.query('BEGIN');
    
    // Save subject and content as separate settings
    const subjectKey = `email_${template}_subject`;
    const contentKey = `email_${template}_content`;
    
    const query = `
      INSERT INTO settings (key, value, updated_at)
      VALUES ($1, $2, NOW()), ($3, $4, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW()
      RETURNING *
    `;
    
    await db.query(query, [subjectKey, subject, contentKey, content]);
    
    await db.query('COMMIT');
    res.json({ message: 'Email template updated successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating email template:', error);
    res.status(500).json({ 
      error: 'Failed to update email template',
      details: error.message 
    });
  }
};
