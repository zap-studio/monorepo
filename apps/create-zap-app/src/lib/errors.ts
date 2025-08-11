export class ProcessExitError extends Error {
  readonly name = 'ProcessExitError';
}

export class PromptError extends Error {
  readonly name = 'PromptError';
}

export class FileSystemError extends Error {
  readonly name = 'FileSystemError';
}

export class ValidationError extends Error {
  readonly name = 'ValidationError';
}

export class PluginError extends Error {
  readonly name = 'PluginError';
}

export class CommandExecutionError extends Error {
  readonly name = 'CommandExecutionError';
}
