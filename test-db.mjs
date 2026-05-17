import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const res = await pool.query('SELECT count(*) FROM products');
  console.log('✅ Connection successful! Products count:', res.rows[0].count);
  const products = await pool.query('SELECT id, "name" FROM products LIMIT 5');
  console.log('Products:', products.rows);
} catch (err) {
  console.error('❌ Connection failed:', err.message);
} finally {
  await pool.end();
}
