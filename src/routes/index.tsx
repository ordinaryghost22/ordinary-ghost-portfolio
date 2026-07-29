import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from '@/components/layout'
import { CaseStudyPage } from '@/pages/CaseStudyPage'
import { HomePage } from '@/pages/HomePage'
import { SiteCaseStudyPage } from '@/pages/SiteCaseStudyPage'

export const router = createBrowserRouter([
  {
    path: '/site-case-study',
    element: <SiteCaseStudyPage />,
  },
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
