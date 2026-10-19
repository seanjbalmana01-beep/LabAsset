
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

async function getConnection() {
    return mysql.createConnection(dbConfig);
}

app.get('/health', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();
        await connection.execute('SELECT 1');

        res.status(200).json({
            status: 'healthy',
            service: 'request-service',
            database: 'connected'
        });
    } catch (err) {
        console.error('Request Service health check failed:', err);

        res.status(503).json({
            status: 'unhealthy',
            service: 'request-service',
            database: 'disconnected'
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Failed to close database connection:', err);
            }
        }
    }
});

app.get('/requests', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.execute(`
            SELECT
                id,
                professor,
                equipment,
                room,
                request_date,
                status,
                created_at
            FROM requests
            ORDER BY id DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: 'Database error'
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Failed to close database connection:', err);
            }
        }
    }
});

app.post('/requests', async (req, res) => {
    const {
        professor,
        equipment,
        room,
        request_date
    } = req.body;

    if (!professor || !equipment || !room || !request_date) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }

    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.execute(
            `
            INSERT INTO requests
                (professor, equipment, room, request_date, status)
            VALUES (?, ?, ?, ?, 'Pending')
            `,
            [
                professor,
                equipment,
                room,
                request_date
            ]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Request created successfully'
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: 'Database error'
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Failed to close database connection:', err);
            }
        }
    }
});

app.put('/requests/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
        return res.status(400).json({
            error: 'Invalid status'
        });
    }

    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.execute(
            `
            UPDATE requests
            SET status = ?
            WHERE id = ?
            `,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Request not found'
            });
        }

        res.json({
            message: 'Request updated successfully'
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: 'Database error'
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Failed to close database connection:', err);
            }
        }
    }
});

app.listen(3001, () => {
    console.log('Request Service running on port 3001');
});
