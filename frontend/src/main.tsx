import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "../app/root";
import Home from "../app/routes/home";
import TodosRoute from "../app/routes/todos";
import KanbanRoute from "../app/routes/kanban";

// Route objects allow future expansion (boards, cards, settings, etc.)
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, 
    children: [
      { index: true, element: <Home /> },
      { path: "todos", element: <TodosRoute /> },
      { path: "kanban", element: <KanbanRoute /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
