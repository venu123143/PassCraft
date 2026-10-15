import { Outlet, ScrollRestoration } from 'react-router'
import { API_BASE_URL } from '@/constants/config'
import { SiteHeader } from './SiteHeader'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-surface px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 text-sm text-muted-foreground sm:px-6">
        Passes are issued through the{' '}
        <a href={`${API_BASE_URL}/docs`} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">
          PassCraft API
        </a>
        .
      </footer>
      <ScrollRestoration />
    </div>
  )
}
