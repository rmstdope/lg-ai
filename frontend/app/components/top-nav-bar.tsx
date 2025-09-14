import { ThemeToggle } from "./theme-toggle";
import { NavLink } from "react-router-dom";

export function TopNavBar() {
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
          </nav>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
