import { Request, Response, NextFunction } from "express";
import { db } from '../db';

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
  // Query the users table for a match
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (!user) {
    res.setHeader("WWW-Authenticate", "Basic realm=api");
    return res.status(401).json({ message: "Invalid credentials" });
  }
  (req as any).user = user;
  next();
}
