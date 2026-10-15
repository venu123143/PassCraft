import { Toaster as Sonner } from 'sonner'
import { useTheme } from '@/hooks/useTheme'

/** Sonner toasts, themed to match the app. */
export function Toaster() {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-xl! border-border! bg-surface! text-foreground! font-sans! shadow-lg!',
          description: 'text-muted-foreground!',
        },
      }}
    />
  )
}
