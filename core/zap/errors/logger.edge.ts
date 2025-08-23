import 'server-only';

export function logError(error: unknown) {
  if (error instanceof Error) {
    process.stderr.write(`[${error.name}] ${error.message}\n${error.stack}`);
  } else {
    process.stderr.write(`Unknown error: ${error}\n`);
  }
}
