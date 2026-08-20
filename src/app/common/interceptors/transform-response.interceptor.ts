import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_TRANSFORM_KEY } from '../constants/metadata.constants';
import { ApiResponse, PaginationMeta } from '../interfaces/api-response.interface';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    // Skip transformation for GraphQL requests
    if (context.getType().toString() === 'graphql') {
      return next.handle();
    }

    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse();
    const statusCode = response?.statusCode || 200;

    return next.handle().pipe(
      map((result) => {
        // If result already formatted or is a stream/buffer, return as is
        if (result && typeof result === 'object' && result.success !== undefined && result.statusCode !== undefined) {
          return result;
        }

        let message = 'Operation successful';
        let data = result;
        let meta: PaginationMeta | undefined = undefined;

        if (result && typeof result === 'object' && !Array.isArray(result)) {
          if ('data' in result && ('meta' in result || 'message' in result)) {
            data = result.data;
            meta = result.meta;
            message = result.message || message;
          } else if ('message' in result && Object.keys(result).length === 1) {
            message = result.message;
            data = null;
          }
        }

        return {
          success: true,
          statusCode,
          message,
          data,
          meta,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
