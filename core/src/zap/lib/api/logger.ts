export function logError(error: unknown) {
  if (error instanceof Error) {
    console.error(`[${error.name}] ${error.message}`, error.stack);
  } else {
    console.error("Unknown error", error);
  }
}
