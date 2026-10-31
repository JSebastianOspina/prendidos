# Backend Standards (eval sandbox)

## Technology Stack

- Framework: **NestJS**
- ORM: **Prisma** + PostgreSQL
- Testing: **Jest**, ≥ 90% coverage target
- File naming: **kebab-case** (e.g. `health-check.controller.ts`)

## Architecture

- Pattern: NestJS modules with controller + service
- Controllers stay thin; business logic in services
- Do **not** use Express directly — use NestJS decorators

## API routes

- Use kebab-case path segments: `/api/v1/health-check`
