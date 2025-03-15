import "@/styles/animation.css";

import { Zap, Shield, Brain, Code, Rocket, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col justify-between bg-gradient-to-br from-black to-gray-800">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-3">
          <Zap className="h-8 w-8 animate-pulse text-yellow-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Zap.ts
          </h1>
        </div>

        <Link
          href="https://github.com/trotelalexandre/zap.ts"
          target="_blank"
          className="inline-flex items-center rounded-md border border-yellow-500 bg-yellow-400 p-2 text-sm text-black hover:bg-yellow-300"
        >
          Get Started <ArrowUpRight className="ml-2 h-4 w-4" />
        </Link>
      </header>

      <main className="flex flex-col items-center justify-center gap-8 px-8 py-20">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-5xl leading-tight font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
            Build Apps{" "}
            <span className="animate-[gradient_4s_ease_infinite] bg-[linear-gradient(to_right,#facc15,#f97316,#ef4444,#f97316,#facc15)] bg-[length:300%_100%] bg-clip-text text-transparent">
              Lightning Fast
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-center text-lg text-gray-300 md:text-xl">
            Next.js boilerplate with auth, AI, type-safe APIs, and the best
            tools to ship products in record time.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col items-center gap-3 rounded-lg p-4 transition-all hover:bg-gray-700/50">
            <Shield className="h-10 w-10 text-yellow-400" />
            <span className="text-sm font-medium text-white">
              Auth Built-In
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-lg p-4 transition-all hover:bg-gray-700/50">
            <Brain className="h-10 w-10 text-yellow-400" />
            <span className="text-sm font-medium text-white">AI Powered</span>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-lg p-4 transition-all hover:bg-gray-700/50">
            <Code className="h-10 w-10 text-yellow-400" />
            <span className="text-sm font-medium text-white">
              Type-Safe APIs
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-lg p-4 transition-all hover:bg-gray-700/50">
            <Rocket className="h-10 w-10 text-yellow-400" />
            <span className="text-sm font-medium text-white">
              Top Libraries
            </span>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-300">
        <p>Made with ⚡ by Alexandre Trotel</p>
      </footer>
    </div>
  );
}
