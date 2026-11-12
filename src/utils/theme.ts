export type ThemeMode = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'winform_theme_mode_v1';

export function getSavedThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'system';
}

export function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (err) {
    console.warn('Failed to save theme mode to localStorage', err);
  }
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return getSystemPrefersDark();
}

export function applyThemeToDocument(isDark: boolean): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}
