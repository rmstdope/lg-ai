import request from 'supertest';
import { beforeAll, describe, it, expect } from 'vitest';
import { createApp } from '../server';

let app: ReturnType<typeof createApp>;
const auth = { user: 'henrik', pass: 'secret' };

beforeAll(() => {
  app = createApp();
});

describe('Users API', () => {
  it('lists all users (no password)', async () => {
    const res = await request(app)
      .get('/users')
      .auth(auth.user, auth.pass);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(2);
    res.body.items.forEach((u: any) => {
      expect(u).toHaveProperty('id');
      expect(u).toHaveProperty('username');
      expect(u).not.toHaveProperty('password');
    });
  });

  it('gets a user by id (no password)', async () => {
    // Get a user id from the list
    const listRes = await request(app)
      .get('/users')
      .auth(auth.user, auth.pass);
    const user = listRes.body.items[0];
    const res = await request(app)
      .get(`/users/${user.id}`)
      .auth(auth.user, auth.pass);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', user.id);
    expect(res.body).toHaveProperty('username', user.username);
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 404 for missing user', async () => {
    const res = await request(app)
      .get('/users/999999')
      .auth(auth.user, auth.pass);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('code', 404);
  });

  it('returns 400 for invalid user id', async () => {
    const res = await request(app)
      .get('/users/abc')
      .auth(auth.user, auth.pass);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('code', 400);
  });
});
