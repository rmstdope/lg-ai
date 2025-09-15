import { Request, Response, NextFunction } from "express";

const USERS = [
  { username: "henrik", password: "secret" },
  { username: "marcus", password: "moresecret" },
];

export function basicAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", "Basic realm=api");
    return res.status(401).json({ message: "Authentication required" });
  }
  const base64 = auth.replace("Basic ", "");
  let decoded = "";
  try {
    decoded = Buffer.from(base64, "base64").toString();
  } catch {
    return res.status(400).json({ message: "Invalid auth encoding" });
  }
  const [username, password] = decoded.split(":");
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    res.setHeader("WWW-Authenticate", "Basic realm=api");
    return res.status(401).json({ message: "Invalid credentials" });
  }
  // Optionally attach user info to req
  (req as any).user = user;
  next();
}
