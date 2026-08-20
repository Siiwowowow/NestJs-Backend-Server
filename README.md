# Primary Reusable NestJS Backend Starter

A production-ready, highly modular, fast, and scalable **NestJS Backend Starter/Template**. Designed as the primary foundation for SaaS, E-commerce, CMS, LMS, Booking systems, and custom REST + GraphQL backends.

---

## ⚡ Key Highlights & Architecture Philosophy

- **Zero Over-engineering**: Minimal generic setup without project-specific bloat.
- **Unified Auth**: Powered by [Better Auth](https://better-auth.com) with secure HTTP-only cookies and sessions. Symmetrically works across **REST** and **GraphQL**.
- **Database**: PostgreSQL with **Prisma (Multi-file Schema in `prisma/schema/`)** and connection pooling via `@prisma/adapter-pg`.
- **Validation**: Strict **Zod** schema validation via custom `ZodValidationPipe`.
- **API Formats**: Native **REST** Controllers + **GraphQL** Resolvers with **DataLoader** optimization for zero N+1 queries.
- **Centralized Infrastructure**:
  - `infrastructure/cloudinary`: Stream-based file uploads, transforms, deletions.
  - `infrastructure/email`: Nodemailer transporter + EJS template rendering (OTP, verification, password reset).
  - `infrastructure/logging`: Structured environment-aware logger with credential sanitization.
  - `shared/otp`: Numeric OTP token lifecycle management.
  - `shared/pagination`: Generic database pagination utility.
- **Centralized Common Layer**:
  - Global `AuthGuard` & `RolesGuard` for both REST and GraphQL.
  - `GlobalExceptionFilter` catching domain `AppException`, Zod errors, Prisma constraint errors, and standard HTTP errors.
  - `TransformResponseInterceptor` formatting all successful REST responses into `{ success: true, statusCode: 200, message: "...", data: ... }`.
  - Reusable decorators: `@CurrentUser()`, `@Roles()`, `@Public()`, `@SkipTransform()`.

---

## 📁 Directory Structure

```text
NestJS-Backend-Server/
│
├── .env.example
├── .gitignore
├── .npmrc
├── nest-cli.json
├── package.json
├── prisma.config.ts
├── tsconfig.json
├── README.md
│
├── prisma/
│   └── schema/
│       ├── schema.prisma       # Generator & DataSource config
│       ├── enum.prisma         # Role, UserStatus, TokenType enums
│       ├── auth.prisma         # User, Session, Account, Verification, OtpToken
│       └── admin.prisma        # AdminProfile, AuditLog
│
└── src/
    ├── main.ts                 # Bootstrap with Helmet, CORS, CookieParser, Global Prefix
    ├── app.module.ts           # Central module wiring guards, filters, interceptors
    ├── schema.gql              # Auto-generated GraphQL Schema
    │
    └── app/
        ├── config/             # Typed environment & module configurations
        │   ├── env.config.ts   # Zod schema environment validator
        │   ├── app.config.ts
        │   ├── database.config.ts
        │   ├── auth.config.ts
        │   ├── cloudinary.config.ts
        │   ├── email.config.ts
        │   ├── graphql.config.ts
        │   └── security.config.ts
        │
        ├── common/             # Globally reusable layer
        │   ├── constants/      # Global metadata keys & tokens
        │   ├── decorators/     # @CurrentUser(), @Public(), @Roles(), @SkipTransform()
        │   ├── dto/            # Base Pagination query DTOs
        │   ├── enums/          # Role, UserStatus, ErrorCode
        │   ├── exceptions/     # AppException, ValidationException, NotFoundException, etc.
        │   ├── filters/        # GlobalExceptionFilter (REST + GraphQL)
        │   ├── guards/         # AuthGuard, RolesGuard
        │   ├── interceptors/   # TransformResponseInterceptor, LoggingInterceptor
        │   ├── interfaces/     # ApiResponse, AuthUser, Context interfaces
        │   ├── middleware/     # RequestIdMiddleware
        │   ├── pipes/          # ZodValidationPipe
        │   └── utils/          # CookieUtil, JwtUtil, DateUtil
        │
        ├── database/           # Prisma singleton module & service
        │   ├── prisma.module.ts
        │   └── prisma.service.ts
        │
        ├── infrastructure/     # Vendor integrations
        │   ├── cloudinary/     # CloudinaryService (upload, delete, optimize)
        │   ├── email/          # EmailService (Nodemailer + EJS templates)
        │   └── logging/        # AppLoggerService
        │
        ├── shared/             # Shared internal domain services
        │   ├── otp/            # OtpService (generate, store, verify)
        │   └── pagination/     # PaginationService
        │
        ├── auth/               # Better Auth integration
        │   ├── better-auth.instance.ts
        │   ├── auth.service.ts
        │   ├── auth.controller.ts # REST endpoints (/api/v1/auth/*)
        │   ├── auth.resolver.ts   # GraphQL queries & mutations
        │   ├── dto/               # Zod auth schemas
        │   └── entities/          # GraphQL ObjectTypes
        │
        ├── graphql/            # GraphQL infrastructure
        │   ├── graphql.module.ts
        │   ├── loaders/        # DataLoader factory & user loader
        │   └── plugins/        # GraphQL monitoring plugin
        │
        ├── modules/            # Core business modules
        │   ├── user/           # User profile, avatars, user list
        │   └── admin/          # Role/status management, audit logs, system stats
        │
        └── templates/          # EJS email templates
            ├── otp.ejs
            ├── verify-email.ejs
            └── reset-password.ejs
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your PostgreSQL and vendor credentials:
```bash
cp .env.example .env
```

### 3. Database Migration & Prisma Generation
```bash
pnpm prisma:generate
pnpm prisma:migrate
```

### 4. Run Development Server
```bash
pnpm start:dev
```

Server endpoints:
- **REST API Base**: `http://localhost:5000/api/v1`
- **GraphQL Sandbox**: `http://localhost:5000/graphql`
- **Auth Endpoint**: `http://localhost:5000/api/v1/auth`

---

## 🛠️ How to Add a New Business Module

To add a new module (e.g. `product`), follow this simple workflow:

1. **Create Schema File** (optional):
   Add `prisma/schema/product.prisma`:
   ```prisma
   model Product {
     id        String   @id @default(cuid())
     title     String
     price     Float
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@map("products")
   }
   ```
   Run: `pnpm prisma:generate` & `pnpm prisma:migrate`

2. **Generate Module Files**:
   ```bash
   pnpm nest g module app/modules/product
   pnpm nest g service app/modules/product
   pnpm nest g controller app/modules/product
   ```

3. **Reuse Infrastructure**:
   In `product.service.ts`:
   ```ts
   import { Injectable } from '@nestjs/common';
   import { PrismaService } from '../../database/prisma.service';
   import { PaginationService } from '../../shared/pagination/pagination.service';
   import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';

   @Injectable()
   export class ProductService {
     constructor(
       private readonly prisma: PrismaService,
       private readonly pagination: PaginationService,
       private readonly cloudinary: CloudinaryService,
     ) {}

     async getProducts(query: PaginationQueryDto) {
       return this.pagination.paginate(this.prisma.product, {}, query);
     }
   }
   ```

4. **Protect Routes**:
   In `product.controller.ts`:
   ```ts
   @Controller('products')
   export class ProductController {
     constructor(private readonly productService: ProductService) {}

     @Public()
     @Get()
     async getProducts(@Query() query: PaginationQueryDto) {
       return this.productService.getProducts(query);
     }

     @Roles(Role.ADMIN)
     @Post()
     @UsePipes(new ZodValidationPipe(createProductSchema))
     async createProduct(@Body() dto: CreateProductDto) {
       return this.productService.create(dto);
     }
   }
   ```

---

## 📦 Scripts Reference

| Command | Description |
|---|---|
| `pnpm start:dev` | Start NestJS with hot reload |
| `pnpm build` | Build production bundle in `dist/` |
| `pnpm start:prod` | Run compiled production bundle |
| `pnpm prisma:generate` | Generate Prisma client from `prisma/schema/` |
| `pnpm prisma:migrate` | Run database migrations |
| `pnpm prisma:studio` | Open Prisma Studio in browser |
| `pnpm lint` | Run ESLint check and fix |
| `pnpm format` | Format files with Prettier |
