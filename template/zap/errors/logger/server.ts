import "server-only";

export function logError(error: unknown) {
  let message: string;
  if (error instanceof Error) {
    message = `[${error.name}] ${error.message}\n${error.stack}`;
  } else {
    message = `Unknown error: ${error}`;
  }

  process.stderr.write(`${message}\n`);
}
