import { use } from 'react'
import { ThemeContext, type ThemeContextValue } from '@/context/theme-context'

export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>')
  return context
}
