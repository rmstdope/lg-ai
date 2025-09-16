import { ThemeToggle } from "./theme-toggle";
import { NavLink } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export function TopNavBar() {
  const [username, setUsername] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  function handleLogout() {
    localStorage.removeItem("auth");
    window.location.reload();
  }

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
            <div className="relative" ref={dropdownRef}>
              <button
                className="text-sm text-muted-foreground mr-2 px-2 py-1 rounded hover:bg-muted/60 focus:outline-none focus:ring"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {username}
                <svg className="inline ml-1 w-3 h-3" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-lg z-50">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/40"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
