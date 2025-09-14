import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { nowIso } from "../config";
import { db } from "../db";
import { migrate } from "../db/migrate";
import { seed } from "../db/seed";
import {
  create,
  getById,
  list,
  remove,
  update,
  type CreateInput,
} from "./todos";

// Helper to reset tables between tests (lightweight since sqlite is file-based)
function clearAll() {
  db.exec(`DELETE FROM todo_tags; DELETE FROM todos;`);
}

beforeAll(() => {
  migrate(db as any, { isNewFile: false });
});

beforeEach(() => {
  clearAll();
  seed(db as any); // seed provides a variety of statuses, tags, priorities
});

describe("todos repo", () => {
  it("lists paginated todos with total", () => {
    const { items, total } = list({
      limit: 5,
      offset: 0,
      sort: "updatedAt",
      order: "desc",
    } as any);
    expect(items.length).toBeLessThanOrEqual(5);
    expect(total).toBeGreaterThan(5);
  });

  it("filters by status", () => {
    const { items } = list({ limit: 50, offset: 0, status: "done" } as any);
    expect(items.every((t) => t.status === "done")).toBe(true);
  });

  it("filters by tag", () => {
    const { items } = list({ limit: 50, offset: 0, tag: "api" } as any);
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((t) => t.tags.includes("api"))).toBe(true);
  });

  it("filters overdue", () => {
    const { items } = list({ limit: 100, offset: 0, overdue: true } as any);
    // All overdue should have dueAt < now and not done/archived
    const now = nowIso();
    expect(items.length).toBeGreaterThan(0);
    expect(
      items.every(
        (t) =>
          !!t.dueAt && t.dueAt < now && !["done", "archived"].includes(t.status)
      )
    ).toBe(true);
  });

  it("searches by q across title/description", () => {
    const { items } = list({ limit: 100, offset: 0, q: "pagination" } as any);
    expect(items.length).toBeGreaterThan(0);
    expect(
      items.some(
        (t) =>
          /pagination/i.test(t.title) || /pagination/i.test(t.description || "")
      )
    ).toBe(true);
  });

  it("creates a todo with tags", () => {
    const created = create({
      title: "Repo Test",
      tags: ["x", "y"],
      priority: 2,
    } as CreateInput);
    expect(created.id).toBeDefined();
    expect(created.tags).toContain("x");
    expect(created.priority).toBe(2);
    const fetched = getById(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it("updates a todo with optimistic concurrency success", () => {
    const { items } = list({ limit: 1, offset: 0 } as any);
    const target = items[0];
    const updated = update(target.id, target.version, {
      title: "Updated Title",
    });
    expect(updated.title).toBe("Updated Title");
    expect(updated.version).toBe(target.version + 1);
  });

  it("conflict on version mismatch throws", () => {
    const { items } = list({ limit: 1, offset: 0 } as any);
    const target = items[0];
    expect(() =>
      update(target.id, target.version + 5, { title: "Bad" })
    ).toThrow();
  });

  it("replaces tags on update", () => {
    const { items } = list({ limit: 1, offset: 0 } as any);
    const target = items[0];
    const updated = update(target.id, target.version, { tags: ["newtag"] });
    expect(updated.tags).toEqual(["newtag"]);
  });

  it("removes a todo", () => {
    const created = create({ title: "Delete Me" } as CreateInput);
    remove(created.id);
    const again = getById(created.id);
    expect(again).toBeUndefined();
  });

  it("sorts by priority asc", () => {
    const { items } = list({
      limit: 10,
      offset: 0,
      sort: "priority",
      order: "asc",
    } as any);
    const priorities = items.map((i) => i.priority);
    const sorted = [...priorities].sort((a, b) => a - b);
    expect(priorities).toEqual(sorted);
  });
});
