import { cva } from 'class-variance-authority'

/** Button styles, shared by <Button> and links styled as buttons. */
export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,box-shadow,transform] select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'border border-border bg-surface text-foreground hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        link: 'h-auto px-0 text-primary underline-offset-4 hover:underline',
        destructive: 'text-destructive hover:bg-destructive/10',
      },
      size: {
        sm: 'h-9 rounded-lg px-3 text-sm',
        md: 'h-11 rounded-xl px-5 text-[0.95rem]',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'size-10 rounded-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)
