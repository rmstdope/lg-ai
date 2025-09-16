
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { migrate } from '../db/migrate';
import { seed } from '../db/seed';
import * as usersRepo from './users';

beforeEach(() => {
  migrate(db as any, { isNewFile: true });
  seed(db as any);
});

describe('users repo', () => {
  it('lists all users (no password)', () => {
    const users = usersRepo.listUsers();
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(users.some(u => u.username === 'henrik')).toBe(true);
    expect(users.some(u => u.username === 'marcus')).toBe(true);
    users.forEach(u => {
      expect(u).not.toHaveProperty('password');
    });
  });

  it('gets user by id (no password)', () => {
    const all = usersRepo.listUsers();
    const user = usersRepo.getUserById(all[0].id);
    expect(user).toBeDefined();
    expect(user!.username).toBe(all[0].username);
    expect(user).not.toHaveProperty('password');
  });

  it('gets user by username (no password)', () => {
    const user = usersRepo.getUserByUsername('henrik');
    expect(user).toBeDefined();
    expect(user!.username).toBe('henrik');
    expect(user).not.toHaveProperty('password');
  });

  it('creates a new user (no password in return)', () => {
    const user = usersRepo.createUser('alice', 'pw123');
    expect(user).toBeDefined();
    expect(user.username).toBe('alice');
    expect(user).not.toHaveProperty('password');
    const found = usersRepo.getUserByUsername('alice');
    expect(found).toBeDefined();
    expect(found!.id).toBe(user.id);
    expect(found).not.toHaveProperty('password');
  });

  it('deletes a user', () => {
    const user = usersRepo.createUser('bob', 'pw456');
    usersRepo.deleteUser(user.id);
    const found = usersRepo.getUserById(user.id);
    expect(found).toBeUndefined();
  });

  it('can get user with password for auth only', () => {
    const user = usersRepo.createUser('authuser', 'pw789');
    const found = usersRepo.getUserWithPasswordByUsername('authuser');
    expect(found).toBeDefined();
    expect(found!.username).toBe('authuser');
    expect(found!.password).toBe('pw789');
  });
});
