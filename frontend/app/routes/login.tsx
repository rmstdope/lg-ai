import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginRoute() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Try a dummy fetch to backend with basic auth
    const res = await fetch("/api/check", {
      method: "GET",
      headers: {
        Authorization: "Basic " + btoa(`${username}:${password}`),
      },
    });
    if (res.ok) {
      localStorage.setItem("auth", btoa(`${username}:${password}`));
      // Try to get user id from /users?username=... (since /api/check does not return user info)
      try {
        const usersRes = await fetch(`/users?username=${encodeURIComponent(username)}`, {
          headers: { Accept: 'application/json' },
        });
        if (usersRes.ok) {
          const data = await usersRes.json();
          const user = Array.isArray(data.items) ? data.items.find((u: any) => u.username === username) : null;
          if (user && user.id != null) {
            localStorage.setItem('currentUserId', String(user.id));
          }
        }
      } catch (e) {
        // ignore, fallback: currentUserId not set
      }
      navigate(from, { replace: true });
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form className="bg-white p-8 rounded-lg shadow-md w-full max-w-xs flex flex-col gap-4" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-2">Login</h2>
        <input
          className="border rounded px-2 py-1"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button className="bg-primary text-primary-foreground rounded px-3 py-1 mt-2" type="submit">Login</button>
      </form>
    </div>
  );
}
