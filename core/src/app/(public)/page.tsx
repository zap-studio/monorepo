import dynamic from "next/dynamic";
import { Suspense } from "react";

const BASE_CLASS =
  "text-foreground flex h-screen items-center justify-center text-2xl font-bold";

// Fallback component for when landing plugin doesn't exist
function FallbackComponent() {
  return <div className={BASE_CLASS}>Welcome to Zap.ts</div>;
}

// Dynamically import the LandingPage component with lazy loading
const DynamicLandingPage = dynamic(
  () =>
    import("@/zap/landing/pages")
      .then((module) => module._LandingPage)
      .catch(() => {
        const LandingPageFallback = () => <FallbackComponent />;
        LandingPageFallback.displayName = "LandingPageFallback";
        return LandingPageFallback;
      }),
  {
    loading: () => <FallbackComponent />,
  },
);

export const revalidate = 3600; // revalidate every hour

export default function LandingPage() {
  return (
    <Suspense fallback={<FallbackComponent />}>
      <DynamicLandingPage />
    </Suspense>
  );
}
