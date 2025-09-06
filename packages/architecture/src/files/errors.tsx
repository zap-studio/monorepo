import type { FileList } from "../types.js";

export const ErrorFiles: FileList = {
  category: "ERRORS",
  entries: [
    {
      path: "src/app/global-error.tsx",
      status: "added",
      required: false,
      plugins: ["errors"],
      children: (
        <>
          Global error handling component for the application with a
          sophisticated error messages management.
        </>
      ),
    },
    {
      path: "src/app/not-found.tsx",
      status: "added",
      required: false,
      plugins: ["errors"],
      children: (
        <>
          Beautiful custom 404 page for handling "Not Found" errors in the
          application.
        </>
      ),
    },
  ],
};
