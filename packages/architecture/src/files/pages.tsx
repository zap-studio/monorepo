import { Categories } from '../categories';
import type { FileList } from '../types';

export const PagesFiles: FileList = {
  category: Categories.PAGES,
  entries: [
    {
      path: 'src/app/(protected)/app/(sidebar)/',
      status: 'added',
      required: false,
      folder: true,
      children: (
        <>
          Added protected routes for authenticated users with a sidebar layout.
          This includes pages for account management, notifications, settings,
          and billing. Included pages are: `/app`, `/app/account` (WIP),
          `/app/notifications` (WIP), `/app/settings` (WIP).
        </>
      ),
    },
    {
      path: 'src/app/(protected)/app/billing/',
      status: 'added',
      required: false,
      folder: true,
      plugins: ['payments'],
      children: (
        <>
          Added billing routes for user billing information and a billing
          success page. Included pages are: `/app/billing`,
          `/app/billing/success`.
        </>
      ),
    },
    {
      path: 'src/app/(public)/(auth)/',
      status: 'added',
      required: false,
      folder: true,
      plugins: ['auth'],
      children: (
        <>
          Added public authentication routes for user login, registration,
          password recovery, and mail verification. Included pages are:
          `/forgot-password`, `/login`, `/mail-verified`, `/register`, and
          `/reset-password`.
        </>
      ),
    },
    {
      path: 'src/app/(public)/(legal)/',
      status: 'added',
      required: false,
      folder: true,
      plugins: ['legal'],
      children: (
        <>
          Added public legal routes for cookie policy, privacy policy, and terms
          of service. Included pages are: `/cookie-policy`, `/privacy-policy`,
          and `/terms-of-service`.
        </>
      ),
    },
    {
      path: 'src/app/(public)/blog/',
      status: 'added',
      required: false,
      folder: true,
      plugins: ['blog'],
      children: (
        <>
          Added blog routes for listing and viewing blog posts. Included pages
          are: `/blog`, `/blog/[slug]`.
        </>
      ),
    },
    {
      path: 'src/app/(public)/page.tsx',
      status: 'added',
      required: true,
      children: <>Public landing page for the application.</>,
    },
    {
      path: 'src/app/(public)/waitlist/page.tsx',
      status: 'added',
      required: false,
      plugins: ['waitlist'],
      children: (
        <>
          Waitlist page for users to join the waitlist. Included pages are:
          `/waitlist`.
        </>
      ),
    },
    {
      path: 'src/app/page.tsx',
      status: 'deleted',
      required: false,
      children: (
        <>
          Default [Next.js](https://nextjs.org/) homepage, replaced by a custom
          homepage in Zap.ts.
        </>
      ),
    },
  ],
};
