"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { RadioGroup } from "radix-ui";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value);
  };

  const currentTheme = theme || "system";

  const activeClassName =
    "text-foreground bg-accent cursor-pointer p-2 rounded-full";
  const inactiveClassName =
    "text-muted-foreground hover:bg-accent bg-background hover:text-accent-foreground active:bg-accent active:text-accent-foreground cursor-pointer p-2 rounded-full";

  return (
    <RadioGroup.Root
      aria-label="Theme Switcher"
      className="flex w-fit items-center space-x-2 rounded-full border p-1"
      onValueChange={handleThemeChange}
      value={currentTheme}
    >
      <RadioGroup.Item
        className={`${currentTheme === "light" ? activeClassName : inactiveClassName}`}
        onClick={() => handleThemeChange("light")}
        value="light"
      >
        <Sun className="h-4 w-4" />
      </RadioGroup.Item>
      <RadioGroup.Item
        className={`${currentTheme === "system" ? activeClassName : inactiveClassName}`}
        onClick={() => handleThemeChange("system")}
        value="system"
      >
        <Monitor className="h-4 w-4" />
      </RadioGroup.Item>
      <RadioGroup.Item
        className={`${currentTheme === "dark" ? activeClassName : inactiveClassName}`}
        onClick={() => handleThemeChange("dark")}
        value="dark"
      >
        <Moon className="h-4 w-4" />
      </RadioGroup.Item>
    </RadioGroup.Root>
  );
}
