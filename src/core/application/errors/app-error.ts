export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('AUTH_INVALID_CREDENTIALS');
  }
}

export class InvalidRefreshTokenFormatError extends AppError {
  constructor() {
    super('AUTH_INVALID_REFRESH_TOKEN_FORMAT');
  }
}

export class InvalidRefreshTokenError extends AppError {
  constructor() {
    super('AUTH_INVALID_REFRESH_TOKEN');
  }
}
