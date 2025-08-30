/**
 * Regular expression for validating project names.
 * Allows letters, numbers, hyphens, and underscores only.
 */
export const PROJECT_NAME_REGEX: RegExp = /^[A-Za-z0-9_-]+$/;

/**
 * Represents an error that can occur during CLI operations.
 */
export type CliError = {
  /** The error message describing what went wrong */
  message: string;
  /** Optional error code for categorizing the error */
  code?: string;
};

/**
 * Represents the result of a CLI command execution.
 */
export type CommandResult = {
  /** Whether the command executed successfully */
  success: boolean;
  /** Optional success or informational message */
  message?: string;
  /** Optional error details if the command failed */
  error?: CliError;
};
