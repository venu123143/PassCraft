import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-12 w-full min-w-0 rounded-xl border border-input bg-surface px-4 text-base text-foreground transition-[border-color,box-shadow]',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
