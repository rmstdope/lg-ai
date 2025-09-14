import express from "express";
import { PORT } from "./config";
import { db, isNewFile } from "./db";
import { migrate } from "./db/migrate";
import { seed } from "./db/seed";
import { todosRouter } from "./routes/todos";
import { errorMiddleware } from "./utils/errors";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(todosRouter);

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
