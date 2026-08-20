import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums/error-code.enum';

export interface FieldError {
  field: string;
  message: string;
}

export class AppException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly errors?: FieldError[];

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    errors?: FieldError[],
  ) {
    super(
      {
        success: false,
        statusCode,
        errorCode,
        message,
        errors: errors || [],
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
    this.errorCode = errorCode;
    this.errors = errors;
  }
}
