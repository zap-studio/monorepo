import { L } from "../helpers/link.js";
import type { FileList } from "../types.js";

export const DockerFiles: FileList = {
  category: "DOCKER",
  entries: [
    {
      path: ".dockerignore",
      status: "added",
      required: false,
      plugins: ["docker"],
      children: (
        <>
          Similar to `.gitignore`, this file specifies which files and
          directories should be ignored by{" "}
          <L href="https://www.docker.com/">Docker</L>.
        </>
      ),
    },
    {
      path: "Dockerfile.dev",
      status: "added",
      required: false,
      plugins: ["docker"],
      children: (
        <>
          Contains the instructions for building a Docker image provisioning a
          <L href="https://www.postgresql.org/">PostgreSQL</L> database along
          with the application.
        </>
      ),
    },
    {
      path: "Dockerfile.prod",
      status: "added",
      required: false,
      plugins: ["docker"],
      children: (
        <>
          Contains the instructions for building a Docker image for the
          application following{" "}
          <L href="https://github.com/vercel/next.js/tree/canary/examples/with-docker">
            Next.js Docker best practices
          </L>
          .
        </>
      ),
    },
    {
      path: "compose.yml",
      status: "added",
      required: false,
      plugins: ["docker"],
      children: (
        <>
          Contains the configuration for{" "}
          <L href="https://docs.docker.com/compose/">Docker Compose</L> to
          define and run multi-container Docker applications (such as Zap.ts and
          PostgreSQL).
        </>
      ),
    },
  ],
};
