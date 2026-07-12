import request from 'supertest';
import app from '../index.js';

describe('GET /health', () => {
  it('should return 200 OK with status: ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
