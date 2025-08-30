export function App() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 sm:px-8 md:px-16">
      <div className="max-w-2xl text-left space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground">
          <em>Zap Studio</em>
        </h1>

        {/* Who we are */}
        <p className="text-base text-muted-foreground">
          We are a <strong className="text-foreground">developer-focused</strong> studio building open-source projects,
          reusable tools, and design systems to help developers ship <em>faster</em> with
          confidence.
        </p>

        {/* Products */}
        <p className="text-base text-muted-foreground">
          One of our flagship projects is <a href="https://zap-ts.zapstudio.dev/" target="_blank">Zap.ts</a>, a modular boilerplate
          for Next.js to help developers build web applications <em>quickly</em> and <em>securely.</em>
        </p>
      </div>
    </main>
  )
}
