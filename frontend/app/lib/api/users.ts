// API client for users
export interface User {
  id: number;
  username: string;
}

const BASE_URL = "http://localhost:3000";

export async function listUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.items;
}

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return await res.json();
}
