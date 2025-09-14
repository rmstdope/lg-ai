import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TodoCard } from "./TodoCard";
import type { Todo } from "~/lib/types/todo";

const mock: Todo = {
  id: "1",
  title: "Example",
  description: "Desc",
  status: "todo",
  priority: 3,
  tags: ["demo"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
};

describe("TodoCard", () => {
  it("renders title", () => {
    const { getByText } = render(<TodoCard todo={mock} />);
    expect(getByText(/Example/)).toBeInTheDocument();
  });
});
