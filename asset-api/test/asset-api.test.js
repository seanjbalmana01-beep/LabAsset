
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

test('GET /health returns API status', async () => {
    const response = await request(app).get('/health');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
        status: 'OK',
        service: 'asset-api'
    });
});

test('POST /assets rejects an empty name', async () => {
    const response = await request(app)
        .post('/assets')
        .send({
            name: '',
            category: 'Computer',
            status: 'Available'
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'A valid asset name is required');
});

test('POST /assets rejects a missing category', async () => {
    const response = await request(app)
        .post('/assets')
        .send({
            name: 'Laptop',
            status: 'Available'
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'A valid asset category is required');
});

test('POST /assets rejects an invalid status', async () => {
    const response = await request(app)
        .post('/assets')
        .send({
            name: 'Laptop',
            category: 'Computer',
            status: 'Broken'
        });

    assert.equal(response.status, 400);
    assert.match(response.body.error, /Status must be one of/);
});

test('PUT /assets/:id rejects an invalid ID', async () => {
    const response = await request(app)
        .put('/assets/abc')
        .send({
            name: 'Laptop',
            category: 'Computer',
            status: 'Available'
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'A valid asset ID is required');
});

test('DELETE /assets/:id rejects an invalid ID', async () => {
    const response = await request(app).delete('/assets/0');

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'A valid asset ID is required');
});

test('POST /assets rejects a non-string name', async () => {
    const response = await request(app)
        .post('/assets')
        .send({
            name: 123,
            category: 'Computer',
            status: 'Available'
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'A valid asset name is required');
});
