import { isRouteErrorResponse, Outlet } from "react-router-dom";
import "./app.css";
import { ThemeProvider } from "./lib/theme-provider";
import { TopNavBar } from "./components/top-nav-bar";

// AppLayout is the parent route element used by route objects in src/main.tsx
export default function AppLayout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="todo-app-theme">
      <div className="min-h-screen flex flex-col">
        <TopNavBar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
}

// Local error boundary component (can be wired into router if desired)
export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Page Not Found" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl mb-4">😅</div>
        <h1 className="text-2xl font-bold text-foreground">{message}</h1>
        <p className="text-muted-foreground">{details}</p>
        {stack && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
              Show error details
            </summary>
            <pre className="w-full p-4 text-xs bg-muted rounded overflow-x-auto">
              <code>{stack}</code>
            </pre>
          </details>
        )}
        <div className="pt-4">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go back home
          </a>
        </div>
      </div>
    </div>
  );
}
