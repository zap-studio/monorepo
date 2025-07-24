import { Data } from "effect";

export class DatabaseFetchError extends Data.TaggedError("DatabaseFetchError")<{
  message: string;
}> {}
