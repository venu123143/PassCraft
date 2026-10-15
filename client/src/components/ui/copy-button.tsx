import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button, type ButtonProps } from './button'

interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  value: string
  /** What is being copied, used in the accessible name and toast. */
  subject: string
}

export function CopyButton({ value, subject, children, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      toast.error(`Couldn't copy the ${subject}. Select it and copy it manually.`)
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={copy} aria-label={`Copy ${subject}`} {...props}>
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      {children ?? (copied ? 'Copied' : 'Copy')}
    </Button>
  )
}
