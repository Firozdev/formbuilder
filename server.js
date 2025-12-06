const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { init, run, all, get } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

init();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/qrs', async (req, res) => {
  try {
    const { status } = req.query;
    const rows = await all(
      `SELECT * FROM qr_codes ${status ? 'WHERE status = ?' : ''} ORDER BY datetime(created_at) DESC`,
      status ? [status] : []
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/qrs/:id', async (req, res) => {
  try {
    const row = await get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'QR not found' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (_req, res) => {
  try {
    const totals = await get(
      `SELECT 
        (SELECT COUNT(*) FROM qr_codes) AS total,
        (SELECT COUNT(*) FROM qr_codes WHERE status = 'active') AS active,
        (SELECT COUNT(*) FROM qr_codes WHERE status = 'inactive') AS inactive`
    );
    res.json(totals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/qrs', async (req, res) => {
  try {
    const { name, data, status = 'active' } = req.body;
    if (!name || !data) return res.status(400).json({ error: 'Name and data are required' });
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    await run(
      'INSERT INTO qr_codes (id, name, data, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, data, status, timestamp, timestamp]
    );
    const row = await get('SELECT * FROM qr_codes WHERE id = ?', [id]);
    res.status(201).json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/qrs/:id', async (req, res) => {
  try {
    const { name, data, status } = req.body;
    const existing = await get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'QR not found' });
    await run(
      'UPDATE qr_codes SET name = ?, data = ?, status = ?, updated_at = ? WHERE id = ?',
      [name || existing.name, data || existing.data, status || existing.status, new Date().toISOString(), req.params.id]
    );
    const updated = await get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/qrs/:id/activate', async (req, res) => {
  try {
    const qr = await get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    if (!qr) return res.status(404).json({ error: 'QR not found' });
    await run('UPDATE qr_codes SET status = ?, updated_at = ? WHERE id = ?', ['active', new Date().toISOString(), req.params.id]);
    const updated = await get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/qrs/:id/deactivate', async (req, res) => {
  try {
    const qr = await get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    if (!qr) return res.status(404).json({ error: 'QR not found' });
    await run('UPDATE qr_codes SET status = ?, updated_at = ? WHERE id = ?', ['inactive', new Date().toISOString(), req.params.id]);
    const updated = await get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/r/:id', async (req, res) => {
  try {
    const qr = await get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    if (!qr) return res.status(404).send('QR code not found');

    await run(
      'INSERT INTO scan_logs (qr_id, timestamp, ip, user_agent) VALUES (?, ?, ?, ?)',
      [qr.id, new Date().toISOString(), req.ip, req.headers['user-agent'] || 'unknown']
    );

    if (qr.status === 'inactive') {
      return res.status(200).send(`<h1>QR Disabled</h1><p>This QR code is currently disabled.</p>`);
    }

    res.redirect(qr.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`QR Manager running on http://localhost:${PORT}`);
});
