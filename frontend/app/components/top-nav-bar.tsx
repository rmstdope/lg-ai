import { ThemeToggle } from "./theme-toggle";

export function TopNavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section - App branding */}
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="Todo list">
            📋
          </span>
          <h1 className="text-xl font-semibold text-foreground">
            Todo List Manager
          </h1>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
