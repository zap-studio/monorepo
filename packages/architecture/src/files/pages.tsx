import { L } from "../helpers/link.js";
import type { FileList } from "../types.js";

export const PagesFiles: FileList = {
  category: "PAGES",
  entries: [
    {
      path: "src/app/(protected)/app/(sidebar)/",
      status: "added",
      required: false,
      folder: true,
      plugins: ["sidebar"],
      children: (
        <>
          Protected routes for authenticated users with a sidebar layout. This
          includes pages for account management, notifications, settings, and
          billing. Included pages are: `/app`, `/app/account`,
          `/app/notifications`, `/app/settings`.
        </>
      ),
    },
    {
      path: "src/app/(protected)/app/billing/",
      status: "added",
      required: false,
      folder: true,
      plugins: ["payments"],
      children: (
        <>
          Billing routes for user billing information and a billing success
          page. Included pages are: `/app/billing`, `/app/billing/success`.
        </>
      ),
    },
    {
      path: "src/app/(public)/(auth)/",
      status: "added",
      required: false,
      folder: true,
      plugins: ["auth"],
      children: (
        <>
          Public authentication routes for user login, registration, password
          recovery, and mail verification. Included pages are:
          `/forgot-password`, `/login`, `/mail-verified`, `/register`, and
          `/reset-password`.
        </>
      ),
    },
    {
      path: "src/app/(public)/(legal)/",
      status: "added",
      required: false,
      folder: true,
      plugins: ["legal"],
      children: (
        <>
          Public legal routes for cookie policy, privacy policy, and terms of
          service. Included pages are: `/cookie-policy`, `/privacy-policy`, and
          `/terms-of-service`.
        </>
      ),
    },
    {
      path: "src/app/(public)/blog/",
      status: "added",
      required: false,
      folder: true,
      plugins: ["blog"],
      children: (
        <>
          Blog routes for listing and viewing blog posts. Included pages are:
          `/blog`, `/blog/[slug]`.
        </>
      ),
    },
    {
      path: "src/app/(public)/page.tsx",
      status: "added",
      required: true,
      children: <>Public landing page for the application.</>,
    },
    {
      path: "src/app/(public)/waitlist/page.tsx",
      status: "added",
      required: false,
      plugins: ["waitlist"],
      children: (
        <>
          Waitlist page for users to join the waitlist. Included pages are:
          `/waitlist`.
        </>
      ),
    },
    {
      path: "src/app/page.tsx",
      status: "deleted",
      required: false,
      children: (
        <>
          Default <L href="https://nextjs.org/">Next.js</L> homepage, replaced
          by a custom homepage in Zap.ts.
        </>
      ),
    },
  ],
};
