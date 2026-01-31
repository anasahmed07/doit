"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-md border border-border bg-secondary/50">
        <Monitor className="h-4 w-4" />
      </button>
    );
  }

  const cycleTheme = () => {
    console.log("Current theme:", theme, "Resolved:", resolvedTheme);
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  // Use resolvedTheme for the icon display when theme is "system"
  const displayTheme = theme === "system" ? "system" : resolvedTheme;

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-md border border-border bg-secondary/50 hover:bg-secondary transition-colors"
      title={`Theme: ${theme} (click to cycle)`}
    >
      {displayTheme === "light" && <Sun className="h-4 w-4" />}
      {displayTheme === "dark" && <Moon className="h-4 w-4" />}
      {theme === "system" && <Monitor className="h-4 w-4" />}
    </button>
  );
}
