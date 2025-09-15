import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthHeader } from "../lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Try a dummy request to check auth
    const check = async () => {
      const auth = getAuthHeader();
      if (!auth) {
        navigate("/login", { state: { from: location.pathname }, replace: true });
        return;
      }
      const res = await fetch("/api/check", { headers: { Authorization: auth } });
      if (!res.ok) {
        navigate("/login", { state: { from: location.pathname }, replace: true });
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
