import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PassStageProps {
  caption: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/** The panel the pass sits on. Sticky beside the form on wide screens. */
export function PassStage({ caption, children, footer, className }: PassStageProps) {
  return (
    <section
      aria-label="Pass preview"
      className={cn(
        'flex flex-col items-center gap-5 rounded-[1.75rem] bg-stage px-4 py-6 sm:px-8 sm:py-8 lg:sticky lg:top-24',
        className,
      )}
    >
      <div className="w-full max-w-[22rem] text-sm text-muted-foreground">{caption}</div>
      {children}
      {footer && <div className="w-full max-w-[22rem]">{footer}</div>}
    </section>
  )
}
