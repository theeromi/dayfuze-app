import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

const defaultThemes: Theme[] = [
  {
    id: "blue",
    name: "Ocean Blue",
    colors: {
      primary: "#2563eb",
      secondary: "#1e40af",
      accent: "#3b82f6",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#1e293b",
      textSecondary: "#64748b"
    }
  },
  {
    id: "green",
    name: "Forest Green",
    colors: {
      primary: "#059669",
      secondary: "#047857",
      accent: "#10b981",
      background: "#f0fdf4",
      surface: "#ffffff",
      text: "#1e293b",
      textSecondary: "#64748b"
    }
  },
  {
    id: "purple",
    name: "Royal Purple",
    colors: {
      primary: "#7c3aed",
      secondary: "#6d28d9",
      accent: "#8b5cf6",
      background: "#faf5ff",
      surface: "#ffffff",
      text: "#1e293b",
      textSecondary: "#64748b"
    }
  },
  {
    id: "rose",
    name: "Rose Garden",
    colors: {
      primary: "#e11d48",
      secondary: "#be123c",
      accent: "#f43f5e",
      background: "#fef2f2",
      surface: "#ffffff",
      text: "#1e293b",
      textSecondary: "#64748b"
    }
  },
  {
    id: "amber",
    name: "Golden Amber",
    colors: {
      primary: "#d97706",
      secondary: "#b45309",
      accent: "#f59e0b",
      background: "#fffbeb",
      surface: "#ffffff",
      text: "#1e293b",
      textSecondary: "#64748b"
    }
  },
  {
    id: "dark",
    name: "Dark Mode",
    colors: {
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#60a5fa",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f1f5f9",
      textSecondary: "#94a3b8"
    }
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  createCustomTheme: (name: string, colors: ThemeColors) => void;
  deleteCustomTheme: (themeId: string) => void;
  isCustomTheme: (themeId: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0]);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);

  // Load saved theme and custom themes on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('dayfuse-theme');
    const savedCustomThemes = localStorage.getItem('dayfuse-custom-themes');
    
    if (savedCustomThemes) {
      try {
        const parsed = JSON.parse(savedCustomThemes);
        setCustomThemes(parsed);
      } catch (error) {
        console.warn('Failed to parse custom themes from localStorage');
      }
    }

    if (savedThemeId) {
      const allThemes = [...defaultThemes, ...customThemes];
      const theme = allThemes.find(t => t.id === savedThemeId);
      if (theme) {
        setCurrentTheme(theme);
        applyTheme(theme);
      }
    }
  }, []);

  // Apply theme colors to CSS custom properties
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);

    // Apply dark class based on theme
    if (theme.id === 'dark' || theme.colors.background === '#0f172a') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setTheme = (themeId: string) => {
    const allThemes = [...defaultThemes, ...customThemes];
    const theme = allThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      applyTheme(theme);
      localStorage.setItem('dayfuse-theme', themeId);
    }
  };

  const createCustomTheme = (name: string, colors: ThemeColors) => {
    const customTheme: Theme = {
      id: `custom-${Date.now()}`,
      name,
      colors
    };

    const updatedCustomThemes = [...customThemes, customTheme];
    setCustomThemes(updatedCustomThemes);
    localStorage.setItem('dayfuse-custom-themes', JSON.stringify(updatedCustomThemes));
    
    // Automatically apply the new custom theme
    setCurrentTheme(customTheme);
    applyTheme(customTheme);
    localStorage.setItem('dayfuse-theme', customTheme.id);
  };

  const deleteCustomTheme = (themeId: string) => {
    const updatedCustomThemes = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(updatedCustomThemes);
    localStorage.setItem('dayfuse-custom-themes', JSON.stringify(updatedCustomThemes));

    // If the deleted theme was active, switch to default
    if (currentTheme.id === themeId) {
      setTheme(defaultThemes[0].id);
    }
  };

  const isCustomTheme = (themeId: string) => {
    return themeId.startsWith('custom-');
  };

  const themes = [...defaultThemes, ...customThemes];

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themes,
      setTheme,
      createCustomTheme,
      deleteCustomTheme,
      isCustomTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}