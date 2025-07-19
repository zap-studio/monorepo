export const PROJECT_NAME_REGEX = /^[a-zA-Z0-9-_]+$/;

export interface CliError {
  message: string;
  code?: string;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  error?: CliError;
}
