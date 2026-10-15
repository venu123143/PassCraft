import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { ThemeContext, type Theme, type ThemeContextValue } from './theme-context'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function getInitialTheme(): Theme {
  return readStoredTheme() ?? (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light')
}

/** Applies the theme class to <html>, briefly enabling colour transitions. */
function applyTheme(theme: Theme, animate: boolean) {
  const root = document.documentElement
  if (animate) root.classList.add('theme-transition')
  root.classList.toggle('dark', theme === 'dark')
  if (animate) window.setTimeout(() => root.classList.remove('theme-transition'), 250)
}

/**
 * Light/dark theme. Follows the OS setting until the user picks a theme,
 * then remembers that choice in localStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyTheme(next, true)
    try {
      localStorage.setItem(STORAGE_KEYS.theme, next)
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  // Keep following the OS theme while the user hasn't chosen one.
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const onChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme()) return
      const next: Theme = event.matches ? 'dark' : 'light'
      setThemeState(next)
      applyTheme(next, true)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    applyTheme(theme, false)
  }, [theme])

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
