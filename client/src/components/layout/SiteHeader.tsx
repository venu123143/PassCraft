import { NavLink } from 'react-router'
import { APP_NAME } from '@/constants/config'
import { ROUTES } from '@/routes/paths'
import { cn } from '@/utils/cn'
import { ThemeToggle } from './ThemeToggle'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
  )

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
      <rect x="3" y="6" width="26" height="20" rx="5" fill="var(--pass)" />
      <rect x="7" y="11" width="10" height="2.5" rx="1.25" fill="#fff" />
      <rect x="7" y="16" width="6" height="5" rx="1.5" fill="#fff" fillOpacity=".72" />
      <rect x="19" y="15" width="6" height="6" rx="1" fill="#fff" />
    </svg>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <NavLink to={ROUTES.createPass} className="mr-auto flex items-center gap-2.5 rounded-lg" aria-label={`${APP_NAME} home`}>
          <LogoMark />
          <span className="hidden font-display text-lg font-semibold tracking-tight min-[400px]:inline">{APP_NAME}</span>
        </NavLink>

        <nav aria-label="Main" className="flex items-center">
          <NavLink to={ROUTES.createPass} end className={navLinkClass}>
            New pass
          </NavLink>
          <NavLink to={ROUTES.passes} className={navLinkClass}>
            My passes
          </NavLink>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
