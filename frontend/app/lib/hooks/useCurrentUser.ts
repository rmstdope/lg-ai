import { useEffect, useState } from 'react';
import { getUser, type User } from '../api/users';

// This hook assumes the backend exposes the current user id in a cookie or via /me endpoint.
// For now, we'll use a localStorage key 'currentUserId' for demo/dev purposes.
export function useCurrentUser(): { user: User | null, loading: boolean, error: string | null } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idStr = localStorage.getItem('currentUserId');
    if (!idStr) {
      setUser(null);
      setLoading(false);
      return;
    }
    const id = Number(idStr);
    if (!id) {
      setUser(null);
      setLoading(false);
      return;
    }
    getUser(id)
      .then(setUser)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
