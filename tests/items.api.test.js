const request = require('supertest');
const { createApp } = require('../src/app');

const MISSING_UUID = '00000000-0000-4000-8000-000000000000';

describe('Items API', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST /api/items creates an item', async () => {
    const res = await request(app).post('/api/items').send({ name: '  Book  ' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Book', description: '' });
  });

  it.each([
    ['empty body', {}],
    ['empty name', { name: '' }],
    ['non-string name', { name: 123 }],
    ['too long name', { name: 'a'.repeat(101) }],
    ['unknown field', { name: 'ok', isAdmin: true }],
  ])('POST /api/items rejects %s with 400', async (_label, payload) => {
    const res = await request(app).post('/api/items').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('POST /api/items rejects malformed JSON with 400', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Content-Type', 'application/json')
      .send('{bad json');

    expect(res.status).toBe(400);
  });

  it('supports get, patch and delete for an existing item', async () => {
    const { body: created } = await request(app).post('/api/items').send({ name: 'Cup' });
    const url = `/api/items/${created.id}`;

    expect((await request(app).get(url)).body.name).toBe('Cup');
    expect((await request(app).patch(url).send({ name: 'Mug' })).body.name).toBe('Mug');
    expect((await request(app).delete(url)).status).toBe(204);
    expect((await request(app).get(url)).status).toBe(404);
  });

  it('PATCH rejects an empty body with 400', async () => {
    const { body: created } = await request(app).post('/api/items').send({ name: 'Cup' });

    const res = await request(app).patch(`/api/items/${created.id}`).send({});

    expect(res.status).toBe(400);
  });

  it('returns 400 for a non-UUID id', async () => {
    const res = await request(app).get('/api/items/not-a-uuid');

    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown item and unknown route', async () => {
    expect((await request(app).get(`/api/items/${MISSING_UUID}`)).status).toBe(404);
    expect((await request(app).get('/nope')).status).toBe(404);
  });

  it('returns a generic 500 without leaking error details', async () => {
    const failingService = {
      list: () => {
        throw new Error('secret internal detail');
      },
    };
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(createApp({ itemService: failingService })).get('/api/items');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
    errorSpy.mockRestore();
  });

  it('applies rate limiting', async () => {
    const limitedApp = createApp({ rateLimitMax: 1 });

    await request(limitedApp).get('/health');
    const res = await request(limitedApp).get('/health');

    expect(res.status).toBe(429);
  });
});
