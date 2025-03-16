"use client";

import { useTheme } from "@/providers/ThemeProvider"; // Importiamo il contesto
import { Moon, Sun } from "lucide-react"; // Icone per il toggle

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="text-gray-500 hover:text-gray-900 dark:text-white-700 dark:hover:text-white transition"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default DarkModeToggle;
