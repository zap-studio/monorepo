import { Data } from 'effect';

export class ProcessExitError extends Data.TaggedError('ProcessExitError')<{
  message: string;
}> {}

export class PromptError extends Data.TaggedError('PromptError')<{
  message: string;
}> {}
