/**
 * Base class for errors raised by the domain / application layers.
 * These are framework-agnostic; DomainExceptionFilter translates them to HTTP.
 */
export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class PassNotFoundError extends DomainError {
  constructor(public readonly passId: string) {
    super(`Pass with id "${passId}" was not found`);
  }
}

export class InvalidPassError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class UnsupportedWalletPlatformError extends DomainError {
  constructor(public readonly platform: string) {
    super(`No wallet provider is registered for platform "${platform}"`);
  }
}

export class WalletProviderError extends DomainError {
  constructor(
    public readonly platform: string,
    message: string,
    public readonly upstreamStatus?: number,
  ) {
    super(`[${platform}] ${message}`);
  }
}
