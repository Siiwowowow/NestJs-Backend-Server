import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  // Security headers with Apollo Sandbox compatibility
  const helmetFn = (helmet as any).default || helmet;
  app.use(
    helmetFn({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? undefined
          : {
              directives: {
                defaultSrc: [`'self'`],
                styleSrc: [`'self'`, `'unsafe-inline'`, 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
                fontSrc: [`'self'`, 'https://fonts.gstatic.com'],
                imgSrc: [`'self'`, 'data:', 'https://apollo-server-landing-page.cdn.apollographql.com', 'https://res.cloudinary.com'],
                scriptSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],
              },
            },
    }),
  );

  // Cookie parser
  const cookieMiddleware = (cookieParser as any).default || cookieParser;
  app.use(cookieMiddleware(process.env.COOKIE_SECRET || 'secret'));

  // CORS configuration
  const corsFn = (cors as any).default || cors;
  app.use(
    corsFn({
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-request-id'],
    }),
  );

  // Global REST API prefix with clean exclusions
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['', '/', 'health', 'graphql'],
  });

  // Enable graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);

  const reset = '\x1b[0m';
  const cyan = '\x1b[36m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const bold = '\x1b[1m';

  console.log(`
${cyan}${bold}┌──────────────────────────────────────────────────────────────────┐${reset}
${cyan}${bold}│${reset}  ${green}${bold}🚀 NESTJS PRIMARY BACKEND SERVER INITIALIZED SUCCESSFULLY${reset}       ${cyan}${bold}│${reset}
${cyan}${bold}├──────────────────────────────────────────────────────────────────┤${reset}
${cyan}${bold}│${reset}  ${bold}🌐 Root Dashboard:${reset}    ${green}http://localhost:${port}/${reset}                       ${cyan}${bold}│${reset}
${cyan}${bold}│${reset}  ${bold}📡 REST API Base:${reset}     ${cyan}http://localhost:${port}/${apiPrefix}${reset}                 ${cyan}${bold}│${reset}
${cyan}${bold}│${reset}  ${bold}🔮 GraphQL Sandbox:${reset}   ${yellow}http://localhost:${port}/graphql${reset}                 ${cyan}${bold}│${reset}
${cyan}${bold}│${reset}  ${bold}🔒 Auth Endpoints:${reset}    ${cyan}http://localhost:${port}/${apiPrefix}/auth${reset}            ${cyan}${bold}│${reset}
${cyan}${bold}│${reset}  ${bold}❤️  Health Check:${reset}      ${green}http://localhost:${port}/health${reset}                  ${cyan}${bold}│${reset}
${cyan}${bold}├──────────────────────────────────────────────────────────────────┤${reset}
${cyan}${bold}│${reset}  ${bold}⚙️  Environment:${reset}       ${yellow}${process.env.NODE_ENV || 'development'}${reset}                             ${cyan}${bold}│${reset}
${cyan}${bold}│${reset}  ${bold}🗄️  Database:${reset}          ${green}PostgreSQL (Prisma 7 Adapter Active)${reset}     ${cyan}${bold}│${reset}
${cyan}${bold}└──────────────────────────────────────────────────────────────────┘${reset}
`);
}

bootstrap();
