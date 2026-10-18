import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ThemeMode } from '../lib/config'
import { applyTheme, onSystemThemeChange, readStoredTheme, storeTheme } from '../lib/theme'

interface ThemeValue {
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => void
  /** Flips to the opposite of what is currently on screen. */
  toggle: () => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({
  initialMode,
  children,
}: {
  initialMode: ThemeMode
  children: ReactNode
}) {
  // index.html has already resolved the mode before first paint; reading it back
  // here keeps React and the DOM in agreement instead of re-deciding.
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredTheme() ?? initialMode)
  const [isDark, setIsDark] = useState<boolean>(
    () => document.documentElement.dataset.theme === 'dark',
  )

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    storeTheme(next)
    setIsDark(applyTheme(next))
  }, [])

  const toggle = useCallback(() => {
    setModeState((current) => {
      const nextDark = !applyTheme(current)
      const next: ThemeMode = nextDark ? 'dark' : 'light'
      storeTheme(next)
      setIsDark(nextDark)
      return next
    })
  }, [])

  // Follow the OS only while the user has not pinned a scheme.
  useEffect(() => {
    if (mode !== 'auto') return
    return onSystemThemeChange(() => setIsDark(applyTheme('auto')))
  }, [mode])

  const value = useMemo<ThemeValue>(() => ({ mode, isDark, setMode, toggle }), [mode, isDark, setMode, toggle])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
