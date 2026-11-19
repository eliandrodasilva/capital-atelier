const STORAGE_KEY = 'capital-atelier-theme';
const listeners = new Set();

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function getResolvedTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Ignore storage access errors
  }
  return getSystemTheme();
}

export function applyTheme(resolved = getResolvedTheme()) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }
}

export function toggleTheme() {
  const next = getResolvedTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage access errors
  }
  applyTheme(next);
  listeners.forEach((listener) => listener(next));
  return next;
}

export function subscribeTheme(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
