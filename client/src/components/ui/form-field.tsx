import { CircleAlert } from 'lucide-react'
import { cloneElement, isValidElement, useId, type ReactElement } from 'react'
import { cn } from '@/utils/cn'
import { Label } from './label'

interface ControlProps {
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

interface FormFieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  /** A single input-like element; it receives id and ARIA wiring. */
  children: ReactElement<ControlProps>
}

/** Label + control + hint + inline error, wired together for screen readers. */
export function FormField({ label, required, hint, error, className, children }: FormFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  const control = isValidElement(children)
    ? cloneElement(children, { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })
    : children

  return (
    <div className={cn('grid content-start gap-2', className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {control}
      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
