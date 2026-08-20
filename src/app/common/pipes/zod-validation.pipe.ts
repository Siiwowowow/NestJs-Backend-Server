import { PipeTransform, ArgumentMetadata, Injectable } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { ValidationException } from '../exceptions/domain.exceptions';
import { FieldError } from '../exceptions/app.exception';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const activeSchema = this.schema || (metadata.metatype as any)?.schema;

    if (!activeSchema || typeof activeSchema.safeParse !== 'function') {
      return value;
    }

    const result = activeSchema.safeParse(value);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const formattedErrors: FieldError[] = zodError.errors.map((err) => ({
        field: err.path.join('.') || 'root',
        message: err.message,
      }));

      throw new ValidationException(formattedErrors, 'Validation failed');
    }

    return result.data;
  }
}
