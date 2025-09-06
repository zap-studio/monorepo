export class ProcessExitError extends Error {
  readonly name = "ProcessExitError";
}

export class PromptError extends Error {
  readonly name = "PromptError";
}

export class FileSystemError extends Error {
  readonly name = "FileSystemError";
}

export class ValidationError extends Error {
  readonly name = "ValidationError";
}
