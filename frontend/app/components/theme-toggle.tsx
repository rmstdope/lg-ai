import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useTheme } from "~/lib/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing document
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      // If system, switch to light first
      setTheme("light");
    }
  };

  const getTooltipText = () => {
    if (theme === "light") return "Switch to dark mode";
    if (theme === "dark") return "Switch to light mode";
    return "Switch theme";
  };

  const getIcon = () => {
    if (theme === "light") return <Moon className="size-4" />;
    if (theme === "dark") return <Sun className="size-4" />;

    // For system theme, show based on actual applied theme (only after mounting)
    if (mounted && typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      return isDark ? <Sun className="size-4" /> : <Moon className="size-4" />;
    }

    // Default to moon icon during SSR or before mounting
    return <Moon className="size-4" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {getIcon()}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
