
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

const allowedStatuses = [
    'Available',
    'In Use',
    'Under Maintenance'
];

function isValidId(id) {
    return /^\d+$/.test(id) &&
        Number.isSafeInteger(Number(id)) &&
        Number(id) > 0;
}

function validateAssetFields(name, category, status) {
    if (typeof name !== 'string' || !name.trim()) {
        return 'A valid asset name is required';
    }

    if (typeof category !== 'string' || !category.trim()) {
        return 'A valid asset category is required';
    }

    if (
        typeof status !== 'string' ||
        !allowedStatuses.includes(status)
    ) {
        return `Status must be one of: ${allowedStatuses.join(', ')}`;
    }

    return null;
}

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'asset-api'
    });
});

app.get('/assets', async (req, res) => {
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            'SELECT * FROM assets'
        );

        return res.json(rows);
    } catch (err) {
        console.error('Error retrieving assets:', err);

        return res.status(500).json({
            error: 'Database error'
        });
    } finally {
        if (connection) {
            await connection.end().catch((err) => {
                console.error('Error closing database connection:', err);
            });
        }
    }
});

app.post('/assets', async (req, res) => {
    const { name, category, status } = req.body;
    const assetStatus = status === undefined ? 'Available' : status;

    const validationError = validateAssetFields(
        name,
        category,
        assetStatus
    );

    if (validationError) {
        return res.status(400).json({
            error: validationError
        });
    }

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            `INSERT INTO assets (name, category, status)
             VALUES (?, ?, ?)`,
            [name.trim(), category.trim(), assetStatus]
        );

        return res.status(201).json({
            id: result.insertId,
            message: 'Asset created successfully'
        });
    } catch (err) {
        console.error('Error creating asset:', err);

        return res.status(500).json({
            error: 'Database error'
        });
    } finally {
        if (connection) {
            await connection.end().catch((err) => {
                console.error('Error closing database connection:', err);
            });
        }
    }
});

app.put('/assets/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, status } = req.body;

    if (!isValidId(id)) {
        return res.status(400).json({
            error: 'A valid asset ID is required'
        });
    }

    const validationError = validateAssetFields(
        name,
        category,
        status
    );

    if (validationError) {
        return res.status(400).json({
            error: validationError
        });
    }

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            `UPDATE assets
             SET name = ?, category = ?, status = ?
             WHERE id = ?`,
            [name.trim(), category.trim(), status, Number(id)]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Asset not found'
            });
        }

        return res.json({
            message: 'Asset updated successfully'
        });
    } catch (err) {
        console.error('Error updating asset:', err);

        return res.status(500).json({
            error: 'Database error'
        });
    } finally {
        if (connection) {
            await connection.end().catch((err) => {
                console.error('Error closing database connection:', err);
            });
        }
    }
});

app.delete('/assets/:id', async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            error: 'A valid asset ID is required'
        });
    }

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            'DELETE FROM assets WHERE id = ?',
            [Number(id)]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Asset not found'
            });
        }

        return res.json({
            message: 'Asset deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting asset:', err);

        return res.status(500).json({
            error: 'Database error'
        });
    } finally {
        if (connection) {
            await connection.end().catch((err) => {
                console.error('Error closing database connection:', err);
            });
        }
    }
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Invalid JSON request body'
        });
    }

    return next(err);
});

app.listen(3000, () => {
    console.log('Asset API running on port 3000');
});
