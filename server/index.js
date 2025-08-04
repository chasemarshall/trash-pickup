const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function handleError(res, err) {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

app.post('/api/bookings', async (req, res) => {
  const { customer_id, pickup_date, items = [], photos = [] } = req.body;
  if (!customer_id || !pickup_date || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let total = 0;
    const bookingItems = [];
    for (const it of items) {
      const { rows } = await client.query('SELECT base_price FROM items WHERE id=$1', [it.item_id]);
      if (rows.length === 0) throw new Error('Item not found');
      const quantity = it.quantity || 1;
      const basePrice = Number(rows[0].base_price);
      total += basePrice * quantity;
      bookingItems.push({ item_id: it.item_id, quantity, price: basePrice });
    }
    const bookingRes = await client.query(
      'INSERT INTO bookings (customer_id, pickup_date, total_price) VALUES ($1,$2,$3) RETURNING id',
      [customer_id, pickup_date, total]
    );
    const bookingId = bookingRes.rows[0].id;
    for (const bi of bookingItems) {
      await client.query(
        'INSERT INTO booking_items (booking_id, item_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [bookingId, bi.item_id, bi.quantity, bi.price]
      );
    }
    for (const ph of photos) {
      await client.query(
        'INSERT INTO photos (booking_id, file_url, analysis_data) VALUES ($1,$2,$3)',
        [bookingId, ph.file_url, ph.analysis_data || null]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ id: bookingId });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.message === 'Item not found') {
      res.status(400).json({ error: err.message });
    } else {
      handleError(res, err);
    }
  } finally {
    client.release();
  }
});

app.get('/api/bookings', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  try {
    const { rows } = await pool.query(
      `SELECT b.*, 
              COALESCE(json_agg(DISTINCT jsonb_build_object('item_id', bi.item_id, 'quantity', bi.quantity, 'price', bi.price)) FILTER (WHERE bi.item_id IS NOT NULL), '[]') AS items,
              COALESCE(json_agg(DISTINCT jsonb_build_object('id', p.id, 'file_url', p.file_url, 'analysis_data', p.analysis_data)) FILTER (WHERE p.id IS NOT NULL), '[]') AS photos
       FROM bookings b
       LEFT JOIN booking_items bi ON b.id = bi.booking_id
       LEFT JOIN photos p ON b.id = p.booking_id
       WHERE b.customer_id = $1
       GROUP BY b.id
       ORDER BY b.pickup_date`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  const id = req.params.id;
  const { status, total_price } = req.body;
  if (!status && total_price === undefined) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE bookings SET status=COALESCE($1,status), total_price=COALESCE($2,total_price) WHERE id=$3 RETURNING *',
      [status, total_price, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/photos/analyze', (req, res) => {
  const { file_url } = req.body;
  if (!file_url) return res.status(400).json({ error: 'file_url required' });
  const analysis = { score: Math.random() };
  res.json({ file_url, analysis });
});

app.get('/api/users/addresses', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  try {
    const { rows } = await pool.query('SELECT * FROM addresses WHERE user_id=$1 ORDER BY created_at', [userId]);
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/users/addresses', async (req, res) => {
  const { user_id, street, city, state, zip, is_default } = req.body;
  if (!user_id || !street || !city || !state || !zip) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO addresses (user_id, street, city, state, zip, is_default) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [user_id, street, city, state, zip, is_default || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/api/users/payments', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  try {
    const { rows } = await pool.query('SELECT * FROM payment_methods WHERE user_id=$1 ORDER BY created_at', [userId]);
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/users/payments', async (req, res) => {
  const { user_id, provider, account_last4, token, is_default } = req.body;
  if (!user_id || !provider || !account_last4 || !token) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO payment_methods (user_id, provider, account_last4, token, is_default) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [user_id, provider, account_last4, token, is_default || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
