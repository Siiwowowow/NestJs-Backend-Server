import { Injectable, LoggerService as INestLoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements INestLoggerService {
  private context: string = 'App';

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    this.printMessage('LOG', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.printMessage('ERROR', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.printMessage('WARN', message, optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage('DEBUG', message, optionalParams);
    }
  }

  verbose?(message: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage('VERBOSE', message, optionalParams);
    }
  }

  private printMessage(level: string, message: any, optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    const sanitizedMsg = this.sanitize(message);
    const sanitizedParams = optionalParams.map((param) => this.sanitize(param));

    if (process.env.NODE_ENV === 'production') {
      const logObject = {
        timestamp,
        level,
        context: this.context,
        message: sanitizedMsg,
        extra: sanitizedParams.length ? sanitizedParams : undefined,
      };
      console.log(JSON.stringify(logObject));
    } else {
      const color =
        level === 'ERROR'
          ? '\x1b[31m'
          : level === 'WARN'
            ? '\x1b[33m'
            : level === 'DEBUG'
              ? '\x1b[35m'
              : '\x1b[32m';
      const reset = '\x1b[0m';
      console.log(
        `[${timestamp}] ${color}[${level}]${reset} \x1b[36m[${this.context}]\x1b[0m ${sanitizedMsg}`,
        sanitizedParams.length ? sanitizedParams : '',
      );
    }
  }

  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const sensitiveKeys = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'authorization',
      'cookie',
      'otp',
    ];

    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        cleaned[key] = '***REDACTED***';
      } else if (typeof value === 'object') {
        cleaned[key] = this.sanitize(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
}
