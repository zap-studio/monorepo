import { PromptError } from '@/lib/effect';

export function handlePromptError(e: unknown) {
  const errorMessage = e instanceof Error ? e.message : String(e);

  const isUserCancelled =
    errorMessage.includes('User force closed') ||
    errorMessage.includes('User interrupted') ||
    errorMessage.includes('SIGINT') ||
    errorMessage.includes('SIGTERM');

  if (isUserCancelled) {
    process.exit(1);
  }

  return new PromptError({ message: `Prompt failed: ${errorMessage}` });
}
