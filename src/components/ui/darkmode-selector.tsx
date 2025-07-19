"use client";

import { useTheme } from "@/providers/ThemeProvider"; // Importiamo il contesto
import getIcon from "@/lib/IconMap";

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="text-gray-500 hover:text-gray-900 dark:text-white-700 dark:hover:text-white transition"
    >
      {theme === "light" ? getIcon("moon", 18) : getIcon("sun", 20)}
    </button>
  );
};

export default DarkModeToggle;
