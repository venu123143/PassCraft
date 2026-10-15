import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { CreatePassPage } from '@/pages/CreatePassPage'
import { NotFoundPage, RouteErrorPage } from '@/pages/NotFoundPage'
import { ROUTES } from './paths'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      // The landing page loads eagerly; the others are split into their own chunks.
      { path: ROUTES.createPass, element: <CreatePassPage /> },
      {
        path: ROUTES.passes,
        lazy: async () => ({ Component: (await import('@/pages/PassesPage')).PassesPage }),
      },
      {
        path: ROUTES.passDetail,
        lazy: async () => ({ Component: (await import('@/pages/PassDetailPage')).PassDetailPage }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
