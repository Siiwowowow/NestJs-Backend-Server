import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { GqlContextType } from '@nestjs/graphql';
import { AppException, FieldError } from '../exceptions/app.exception';
import { ErrorCode } from '../enums/error-code.enum';
import { ZodError } from 'zod';
import { Prisma } from '../../../generated/prisma';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const hostType = host.getType<GqlContextType>();

    // Handle GraphQL Context
    if (hostType === 'graphql') {
      return this.handleGraphQLError(exception);
    }

    // Handle HTTP / REST Context
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: FieldError[] | undefined = undefined;

    if (exception instanceof AppException) {
      statusCode = exception.getStatus();
      errorCode = exception.errorCode;
      message = exception.message;
      errors = exception.errors;
    } else if (exception instanceof ZodError) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = ErrorCode.VALIDATION_ERROR;
      message = 'Validation failed';
      errors = exception.errors.map((err) => ({
        field: err.path.join('.') || 'root',
        message: err.message,
      }));
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaHandled = this.handlePrismaError(exception);
      statusCode = prismaHandled.statusCode;
      errorCode = prismaHandled.errorCode;
      message = prismaHandled.message;
      errors = prismaHandled.errors;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        errorCode = (res as any).errorCode || this.mapHttpCodeToErrorCode(statusCode);
        errors = (res as any).errors;
      } else {
        message = exception.message;
        errorCode = this.mapHttpCodeToErrorCode(statusCode);
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      if (process.env.NODE_ENV === 'development') {
        message = exception.message;
      }
    }

    const errorResponse = {
      success: false,
      statusCode,
      errorCode,
      message: Array.isArray(message) ? message[0] : message,
      errors: errors && errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(errorResponse);
  }

  private handleGraphQLError(exception: unknown) {
    if (exception instanceof AppException) {
      return exception;
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const handled = this.handlePrismaError(exception);
      return new AppException(handled.message, handled.statusCode, handled.errorCode, handled.errors);
    }
    return exception;
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: HttpStatus;
    errorCode: ErrorCode;
    message: string;
    errors?: FieldError[];
  } {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[])?.join(', ') || 'field';
        return {
          statusCode: HttpStatus.CONFLICT,
          errorCode: ErrorCode.CONFLICT,
          message: `Unique constraint violation on ${target}`,
          errors: [{ field: target, message: `A record with this ${target} already exists` }],
        };
      }
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
          message: (error.meta?.cause as string) || 'Record not found',
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
          message: 'Foreign key constraint failed on the database',
        };
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
          message: 'Database query failed',
        };
    }
  }

  private mapHttpCodeToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHENTICATED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMITED;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}
