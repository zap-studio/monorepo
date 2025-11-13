export function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 sm:px-8 md:px-16">
      <div className="max-w-2xl space-y-6 text-left">
        {/* Title */}
        <h1 className="font-bold text-2xl text-foreground">
          <em>Zap Studio</em>
        </h1>

        {/* Who we are */}
        <p className="text-base text-muted-foreground">
          We are a{" "}
          <strong className="text-foreground">developer-focused</strong> studio
          building open-source projects, reusable tools, and design systems to
          help developers ship <em>faster</em> with confidence.
        </p>

        {/* Products */}
        <p className="text-base text-muted-foreground">
          One of our flagship projects is{" "}
          <a
            href="https://zap-ts.zapstudio.dev/"
            rel="noopener"
            target="_blank"
          >
            Zap.ts
          </a>
          , a modular boilerplate for Next.js to help developers build web
          applications <em>quickly</em> and <em>securely.</em>
        </p>
      </div>
    </main>
  );
}
