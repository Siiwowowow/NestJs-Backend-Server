import { HttpStatus } from '@nestjs/common';
import { AppException, FieldError } from './app.exception';
import { ErrorCode } from '../enums/error-code.enum';

export class ValidationException extends AppException {
  constructor(errors: FieldError[], message: string = 'Validation failed') {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, errors);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Authentication required') {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string = 'Access denied: insufficient permissions') {
    super(message, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
  }
}

export class NotFoundException extends AppException {
  constructor(resource: string = 'Resource', idOrIdentifier?: string) {
    const message = idOrIdentifier
      ? `${resource} with identifier '${idOrIdentifier}' was not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
  }
}

export class ConflictException extends AppException {
  constructor(message: string = 'Resource already exists') {
    super(message, HttpStatus.CONFLICT, ErrorCode.CONFLICT);
  }
}

export class BadRequestException extends AppException {
  constructor(message: string = 'Bad request') {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST);
  }
}
