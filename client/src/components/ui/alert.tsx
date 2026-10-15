import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface AlertProps {
  title: string
  children?: ReactNode
  className?: string
}

/** Inline error block for failed requests. */
export function Alert({ title, children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.07] px-4 py-3 text-sm',
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <div className="grid gap-0.5">
        <p className="font-medium text-foreground">{title}</p>
        {children && <div className="text-muted-foreground">{children}</div>}
      </div>
    </div>
  )
}
