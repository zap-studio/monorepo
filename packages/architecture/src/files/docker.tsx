import { Categories } from '../categories';
import type { FileList } from '../types';

export const DockerFiles: FileList = {
  category: Categories.DOCKER,
  entries: [
    {
      path: '.dockerignore',
      status: 'added',
      required: false,
      children: (
        <>
          Similar to `.gitignore`, this file specifies which files and
          directories should be ignored by [Docker](https://www.docker.com/).
        </>
      ),
    },
    {
      path: 'Dockerfile.dev',
      status: 'added',
      required: false,
      children: (
        <>
          Contains the instructions for building a Docker image provisioning a
          [PostgreSQL](https://www.postgresql.org/) database along with the
          application.
        </>
      ),
    },
    {
      path: 'Dockerfile.prod',
      status: 'added',
      required: false,
      children: (
        <>
          Contains the instructions for building a Docker image for the
          application following [Next.js Docker best
          practices](https://github.com/vercel/next.js/tree/canary/examples/with-docker).
        </>
      ),
    },
    {
      path: 'compose.yml',
      status: 'added',
      required: false,
      children: (
        <>
          Contains the configuration for [Docker
          Compose](https://docs.docker.com/compose/) to define and run
          multi-container Docker applications (such as Zap.ts and PostgreSQL).
        </>
      ),
    },
  ],
};
