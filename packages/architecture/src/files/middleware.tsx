import type { FileList } from "../types.js";

export const MiddlewareFiles: FileList = {
  category: "MIDDLEWARE",
  entries: [
    {
      path: "src/middleware.ts",
      status: "added",
      required: false,
      plugins: ["auth", "blog", "waitlist"],
      children: (
        <>
          Custom middleware for handling requests and responses in Zap.ts. It
          integrates plugins in its logic to provide a seamless experience
          across the application.
        </>
      ),
    },
  ],
};
