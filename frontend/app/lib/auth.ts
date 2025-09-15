// Simple auth util for storing/retrieving basic auth
export function getAuthHeader() {
  const auth = localStorage.getItem("auth");
  return auth ? `Basic ${auth}` : undefined;
}

export function clearAuth() {
  localStorage.removeItem("auth");
}
