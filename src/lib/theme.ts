import type { ThemeMode } from './config'

const STORAGE_KEY = 'sub2api-home-theme'

export function readStoredTheme(): ThemeMode | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' || value === 'auto' ? value : null
  } catch {
    return null
  }
}

export function storeTheme(mode: ThemeMode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* storage can be blocked inside third-party iframes */
  }
}

export function prefersDark(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return prefersDark()
}

export function applyTheme(mode: ThemeMode): boolean {
  const dark = resolveIsDark(mode)
  const root = document.documentElement
  root.dataset.theme = dark ? 'dark' : 'light'
  root.style.colorScheme = dark ? 'dark' : 'light'
  return dark
}

export function onSystemThemeChange(handler: (dark: boolean) => void): () => void {
  const query = window.matchMedia?.('(prefers-color-scheme: dark)')
  if (!query) return () => {}
  const listener = (event: MediaQueryListEvent) => handler(event.matches)
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
