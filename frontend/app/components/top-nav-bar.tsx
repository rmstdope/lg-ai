import { ThemeToggle } from "./theme-toggle";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export function TopNavBar() {
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      try {
        const decoded = atob(auth);
        const [user] = decoded.split(":");
        setUsername(user);
      } catch {
        setUsername(null);
      }
    } else {
      setUsername(null);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section - App branding */}
        <div className="flex items-center gap-5">
          <span className="text-2xl" role="img" aria-label="Todo list">
            📋
          </span>
          <h1 className="text-xl font-semibold text-foreground">
            Todo List Manager
          </h1>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:underline underline-offset-4 ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}`
              }
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/todos"
              className={({ isActive }) =>
                `hover:underline underline-offset-4 ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}`
              }
            >
              Todos
            </NavLink>
            <NavLink
              to="/kanban"
              className={({ isActive }) =>
                `hover:underline underline-offset-4 ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}`
              }
            >
              Kanban
            </NavLink>
          </nav>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {username && (
            <span className="text-sm text-muted-foreground mr-2">{username}</span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
