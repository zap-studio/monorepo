import 'server-only';
import { $fetch } from '@/lib/fetch';

export async function logEdgeError(error: unknown) {
  let message: string;
  if (error instanceof Error) {
    message = `[${error.name}] ${error.message}\n${error.stack}`;
  } else {
    message = `Unknown error: ${error}`;
  }

  await $fetch('/api/errors/log', {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  });
}
