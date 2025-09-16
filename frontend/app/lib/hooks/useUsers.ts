import { useEffect, useState } from 'react';
import { listUsers, getUser, type User } from '../api/users';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}

export function useUserMap() {
  const { users, loading, error } = useUsers();
  // Map of userId to username
  const userMap = users.reduce((acc, u) => {
    acc[u.id] = u.username;
    return acc;
  }, {} as Record<number, string>);
  return { userMap, loading, error };
}
