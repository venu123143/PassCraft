import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { buttonVariants } from '@/components/ui/button-variants'
import { ROUTES } from '@/routes/paths'

export function NotFoundPage() {
  return (
    <div className="grid max-w-xl gap-5">
      <h1 className="text-4xl font-semibold tracking-tight">There's no page here</h1>
      <p className="text-lg text-muted-foreground">The link may be mistyped. Start from a new pass instead.</p>
      <div>
        <Link to={ROUTES.createPass} className={buttonVariants({ size: 'lg' })}>
          Issue a pass
        </Link>
      </div>
    </div>
  )
}

/** Shown when a route throws while rendering. */
export function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  return (
    <main className="mx-auto grid min-h-dvh max-w-xl content-center gap-5 px-4">
      <h1 className="text-4xl font-semibold tracking-tight">This screen failed to load</h1>
      <p className="text-lg text-muted-foreground">Reload the page to try again. Details: {message}</p>
      <div>
        <a href={ROUTES.createPass} className={buttonVariants({ size: 'lg' })}>
          Reload PassCraft
        </a>
      </div>
    </main>
  )
}
