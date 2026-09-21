import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Read saved theme from localStorage, default to 'system'
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('tartuca_theme') || 'system';
    } catch {
      return 'system';
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('tartuca_theme') || 'system' : 'system';
    if (saved === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return saved;
  });

  const applyTheme = useCallback((targetTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const isDark = targetTheme === 'dark';

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const activeResolved = theme === 'system' 
        ? (mediaQuery.matches ? 'dark' : 'light') 
        : theme;
      
      setResolvedTheme(activeResolved);
      applyTheme(activeResolved);
    };

    updateTheme();

    const handleSystemChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme) => {
    try {
      localStorage.setItem('tartuca_theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme in localStorage', e);
    }
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      resolvedTheme, 
      setTheme, 
      isDark: resolvedTheme === 'dark' 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
