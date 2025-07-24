import { Data } from 'effect';

export class ProcessExitError extends Data.TaggedError('ProcessExitError')<{
  message: string;
}> {}
