type HttpStatusCode = 400 | 401 | 403 | 404 | 409 | 500;

export class BaseError extends Error {
  statusCode: HttpStatusCode;
  code: string;
  cause?: unknown;
  constructor(
    message: string,
    statusCode: HttpStatusCode = 500,
    code = "INTERNAL_ERROR",
    cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
    };
  }
}

export class InternalServerError extends BaseError {
  constructor(message = "Internal Server Error", cause?: unknown) {
    super(message, 500, "INTERNAL_SERVER_ERROR", cause);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Not Found", cause?: unknown) {
    super(message, 404, "NOT_FOUND", cause);
  }
}

export class BadRequestError extends BaseError {
  constructor(message = "Bad Request", cause?: unknown) {
    super(message, 400, "BAD_REQUEST", cause);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized", cause?: unknown) {
    super(message, 401, "UNAUTHORIZED", cause);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = "Forbidden", cause?: unknown) {
    super(message, 403, "FORBIDDEN", cause);
  }
}

export class ConflictError extends BaseError {
  constructor(message = "Conflict", cause?: unknown) {
    super(message, 409, "CONFLICT", cause);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message = "Authentication Error", cause?: unknown) {
    super(message, 401, "AUTHENTICATION_ERROR", cause);
  }
}

export class MailError extends BaseError {
  constructor(message = "Mail Error", cause?: unknown) {
    super(message, 500, "MAIL_ERROR", cause);
  }
}

export class PushNotificationError extends BaseError {
  constructor(message = "Push Notification Error", cause?: unknown) {
    super(message, 500, "PUSH_NOTIFICATION_ERROR", cause);
  }
}

export class BaseApplicationError extends Error {
  code: string;
  constructor(
    message = "An unexpected error occurred",
    code = "APPLICATION_ERROR",
    cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      cause: this.cause,
    };
  }
}

export class ApplicationError extends BaseApplicationError {
  constructor(message = "Application Error", cause?: unknown) {
    super(message, "APPLICATION_ERROR", cause);
  }
}

export class ClientError extends ApplicationError {
  constructor(message = "Client Error", cause?: unknown) {
    super(message, "CLIENT_ERROR", cause);
  }
}

export class EnvironmentError extends ApplicationError {
  constructor(message = "Environment Error", cause?: unknown) {
    super(message, "ENVIRONMENT_ERROR", cause);
  }
}

export class FileOperationError extends ApplicationError {
  constructor(message = "File Operation Error", cause?: unknown) {
    super(message, "FILE_OPERATION_ERROR", cause);
  }
}
