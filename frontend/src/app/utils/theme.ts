export type ThemeColor = 'green' | 'teal' | 'blue' | 'amber';
export type ThemeContrast = 'normal' | 'high';

export interface ThemeSettings {
  color: ThemeColor;
  contrast: ThemeContrast;
}

export const THEME_STORAGE_KEY = 'ui_theme_settings';

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  color: 'green',
  contrast: 'normal',
};

const themePalettes: Record<ThemeColor, Record<string, string>> = {
  green: {
    '--primary': '#10b981',
    '--secondary': '#34d399',
    '--accent': '#6ee7b7',
    '--sidebar-primary': '#10b981',
    '--sidebar-ring': '#10b981',
    '--color-magenta': '#10b981',
    '--color-purple': '#34d399',
    '--color-violet': '#6ee7b7',
  },
  teal: {
    '--primary': '#14b8a6',
    '--secondary': '#2dd4bf',
    '--accent': '#5eead4',
    '--sidebar-primary': '#14b8a6',
    '--sidebar-ring': '#14b8a6',
    '--color-magenta': '#14b8a6',
    '--color-purple': '#2dd4bf',
    '--color-violet': '#5eead4',
  },
  blue: {
    '--primary': '#0ea5e9',
    '--secondary': '#38bdf8',
    '--accent': '#7dd3fc',
    '--sidebar-primary': '#0ea5e9',
    '--sidebar-ring': '#0ea5e9',
    '--color-magenta': '#0ea5e9',
    '--color-purple': '#38bdf8',
    '--color-violet': '#7dd3fc',
  },
  amber: {
    '--primary': '#f59e0b',
    '--secondary': '#fbbf24',
    '--accent': '#fde68a',
    '--sidebar-primary': '#f59e0b',
    '--sidebar-ring': '#f59e0b',
    '--color-magenta': '#f59e0b',
    '--color-purple': '#fbbf24',
    '--color-violet': '#fde68a',
  },
};

const contrastPresets: Record<ThemeContrast, Record<string, string>> = {
  normal: {
    '--background': '#0a0118',
    '--foreground': '#ffffff',
    '--card': 'rgba(255, 255, 255, 0.05)',
    '--card-foreground': '#ffffff',
    '--popover': 'rgba(255, 255, 255, 0.08)',
    '--popover-foreground': '#ffffff',
    '--muted': 'rgba(255, 255, 255, 0.05)',
    '--muted-foreground': '#94a3b8',
    '--border': 'rgba(255, 255, 255, 0.1)',
    '--glass-bg': 'rgba(255, 255, 255, 0.05)',
    '--glass-bg-hover': 'rgba(255, 255, 255, 0.1)',
    '--glass-border': 'rgba(255, 255, 255, 0.1)',
    '--glass-border-hover': 'rgba(255, 255, 255, 0.2)',
    '--color-surface': 'rgba(255, 255, 255, 0.05)',
    '--color-surface-hover': 'rgba(255, 255, 255, 0.1)',
    '--color-text-primary': '#ffffff',
    '--color-text-secondary': '#94a3b8',
    '--sidebar': 'rgba(255, 255, 255, 0.05)',
    '--color-sidebar-border': 'rgba(255, 255, 255, 0.1)',
  },
  high: {
    '--background': '#04070f',
    '--foreground': '#f8fafc',
    '--card': 'rgba(255, 255, 255, 0.12)',
    '--card-foreground': '#f8fafc',
    '--popover': 'rgba(255, 255, 255, 0.14)',
    '--popover-foreground': '#f8fafc',
    '--muted': 'rgba(255, 255, 255, 0.12)',
    '--muted-foreground': '#cbd5e1',
    '--border': 'rgba(255, 255, 255, 0.2)',
    '--glass-bg': 'rgba(255, 255, 255, 0.08)',
    '--glass-bg-hover': 'rgba(255, 255, 255, 0.16)',
    '--glass-border': 'rgba(255, 255, 255, 0.2)',
    '--glass-border-hover': 'rgba(255, 255, 255, 0.3)',
    '--color-surface': 'rgba(255, 255, 255, 0.14)',
    '--color-surface-hover': 'rgba(255, 255, 255, 0.18)',
    '--color-text-primary': '#f8fafc',
    '--color-text-secondary': '#cbd5e1',
    '--sidebar': 'rgba(255, 255, 255, 0.08)',
    '--color-sidebar-border': 'rgba(255, 255, 255, 0.2)',
  },
};

const setRootVars = (vars: Record<string, string>) => {
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
};

export const applyThemeSettings = (settings: ThemeSettings) => {
  const palette = themePalettes[settings.color];
  const contrast = contrastPresets[settings.contrast];

  const paletteVars: Record<string, string> = {
    ...palette,
    '--primary-rgb': hexToRgb(palette['--primary']),
    '--secondary-rgb': hexToRgb(palette['--secondary']),
    '--accent-rgb': hexToRgb(palette['--accent']),
  };

  setRootVars({
    ...contrast,
    ...paletteVars,
  });

  if (settings.contrast === 'high') {
    document.documentElement.classList.add('contrast-high');
  } else {
    document.documentElement.classList.remove('contrast-high');
  }
};

export const loadThemeSettings = (): ThemeSettings => {
  if (typeof window === 'undefined') return DEFAULT_THEME_SETTINGS;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (!saved) return DEFAULT_THEME_SETTINGS;
    return JSON.parse(saved) as ThemeSettings;
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
};

export const saveThemeSettings = (settings: ThemeSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
};

export const initThemeSettings = () => {
  applyThemeSettings(loadThemeSettings());
};
