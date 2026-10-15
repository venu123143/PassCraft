import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

interface LabelProps extends ComponentProps<'label'> {
  /** Adds a red asterisk; screen readers hear "required" instead. */
  required?: boolean
}

export function Label({ className, required = false, children, ...props }: LabelProps) {
  return (
    <label className={cn('inline-flex items-baseline gap-1 text-sm font-medium text-foreground', className)} {...props}>
      {children}
      {required && (
        <>
          <span aria-hidden className="text-destructive">
            *
          </span>
          <span className="sr-only">(required)</span>
        </>
      )}
    </label>
  )
}
