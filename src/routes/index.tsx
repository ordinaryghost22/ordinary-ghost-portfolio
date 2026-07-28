import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from '@/components/layout'
import { CaseStudyPage } from '@/pages/CaseStudyPage'
import { HomePage } from '@/pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'work/:slug',
        element: <CaseStudyPage />,
      },
    ],
  },
])
