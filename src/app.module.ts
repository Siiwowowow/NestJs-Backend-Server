import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// Config
import {
  validateEnv,
  appConfig,
  databaseConfig,
  authConfig,
  cloudinaryConfig,
  emailConfig,
  graphqlConfig,
  securityConfig,
} from './app/config';

// Database & Infrastructure
import { PrismaModule } from './app/database';
import { LoggingModule } from './app/infrastructure/logging';
import { CloudinaryModule } from './app/infrastructure/cloudinary';
import { EmailModule } from './app/infrastructure/email';

// Shared
import { OtpModule } from './app/shared/otp/otp.module';
import { PaginationModule } from './app/shared/pagination/pagination.module';

// GraphQL & Auth
import { AppGraphQLModule } from './app/graphql/graphql.module';
import { AuthModule } from './app/auth/auth.module';

// Business Modules
import { AppController } from './app.controller';
import { UserModule } from './app/modules/user/user.module';
import { AdminModule } from './app/modules/admin/admin.module';

// Common Layer Providers
import { AuthGuard } from './app/common/guards/auth.guard';
import { RolesGuard } from './app/common/guards/roles.guard';
import { TransformResponseInterceptor } from './app/common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './app/common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './app/common/filters/global-exception.filter';
import { RequestIdMiddleware } from './app/common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        cloudinaryConfig,
        emailConfig,
        graphqlConfig,
        securityConfig,
      ],
      validate: validateEnv,
    }),
    PrismaModule,
    LoggingModule,
    CloudinaryModule,
    EmailModule,
    OtpModule,
    PaginationModule,
    AppGraphQLModule,
    AuthModule,
    UserModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*path');
  }
}
