import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../server";

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  app = createApp();
});

describe("Todos API", () => {
  it("lists todos", async () => {
    const res = await request(app).get("/todos");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("items");
  });

  it("creates a todo", async () => {
    const res = await request(app).post("/todos").send({ title: "Test Task" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });
});
