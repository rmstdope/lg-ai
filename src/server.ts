import express from "express";
import { PORT } from "./config";
import { db, isNewFile } from "./db";
import { migrate } from "./db/migrate";
import { seed } from "./db/seed";
import { todosRouter } from "./routes/todos";
import { usersRouter } from "./routes/users";
import { errorMiddleware } from "./utils/errors";
import { basicAuthMiddleware } from "./utils/basicAuth";

export function createApp() {
  // Always migrate and seed before creating the app (for tests and dev)
  migrate(db as any, { isNewFile });
  seed(db as any);

  const app = express();

  app.use((req, res, next) => {
    const origin = req.headers.origin || "*";
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin"); // So CDN/proxies don't mix origins
    res.header(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] ||
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "600");

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  });

  app.use(express.json());
  app.use(basicAuthMiddleware);
  app.get("/api/check", (req, res) => res.json({ ok: true }));
  app.use(todosRouter);
  app.use(usersRouter);

  app.use((_req, res, _next) => {
    res.status(404).json({ code: 404, message: "Not found" });
  });
  app.use(errorMiddleware);
  return app;
}

// Initialize DB (migrate + optional seed) before starting server
migrate(db as any, { isNewFile });
if (isNewFile) {
  seed(db as any);
}

if (require.main === module) {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}
