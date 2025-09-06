import "server-only";

export function logMiddlewareError(error: unknown) {
  let message: string;
  if (error instanceof Error) {
    message = `[${error.name}] ${error.message}\n${error.stack}`;
  } else {
    message = `Unknown error: ${error}`;
  }

  // biome-ignore lint/suspicious/noConsole: Edge runtime doesn't support process.stderr so we use console.error instead
  console.error(message);
}
