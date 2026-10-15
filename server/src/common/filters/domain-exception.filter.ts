import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainError,
  InvalidPassError,
  PassNotFoundError,
  UnsupportedWalletPlatformError,
  WalletProviderError,
} from '../errors/domain.errors';

/** Response body for every domain error, mirroring Nest's built-in shape. */
export interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string;
}

/** Translates framework-agnostic domain errors into HTTP responses. */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter<DomainError> {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = DomainExceptionFilter.statusFor(exception);

    const body: ErrorResponseBody = {
      statusCode,
      error: exception.name,
      message: exception.message,
    };
    response.status(statusCode).json(body);
  }

  private static statusFor(exception: DomainError): HttpStatus {
    if (exception instanceof PassNotFoundError) return HttpStatus.NOT_FOUND;
    if (
      exception instanceof InvalidPassError ||
      exception instanceof UnsupportedWalletPlatformError
    ) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof WalletProviderError) return HttpStatus.BAD_GATEWAY;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
