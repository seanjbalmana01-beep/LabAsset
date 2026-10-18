const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD || 'change-me',
    database: process.env.DB_NAME || 'labasset_db'
};

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// GET all assets
app.get('/assets', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM assets');
        await connection.end();

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST - create a new asset
app.post('/assets', async (req, res) => {
    const { name, category, status } = req.body;

    if (!name || !category) {
        return res.status(400).json({
            error: 'Name and category are required'
        });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            `INSERT INTO assets (name, category, status)
             VALUES (?, ?, ?)`,
            [name, category, status || 'Available']
        );

        await connection.end();

        res.status(201).json({
            id: result.insertId,
            message: 'Asset created successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Database error'
        });
    }
});

// PUT - update an existing asset
app.put('/assets/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, status } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            `UPDATE assets
             SET name = ?, category = ?, status = ?
             WHERE id = ?`,
            [name, category, status, id]
        );

        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Asset not found'
            });
        }

        res.json({
            message: 'Asset updated successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Database error'
        });
    }
});

// DELETE - delete an asset
app.delete('/assets/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            'DELETE FROM assets WHERE id = ?',
            [id]
        );

        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Asset not found'
            });
        }

        res.json({
            message: 'Asset deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Database error'
        });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Asset API running on port 3000');
});