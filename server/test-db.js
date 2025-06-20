import db from './config/db.js';

async function testConnection() {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('Database connection successful:', res.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await db.end();
    process.exit(0);
  }
}

testConnection();
