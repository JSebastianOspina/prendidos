---
description: Backend development standards — technology stack, architecture, API design, database patterns, testing, and conventions. Customize before implementation.
globs: ['**/backend/**', '**/src/**', '**/api/**']
alwaysApply: false
---

> **Not applicable yet** — Prendidos has no backend today (see `docs/base-standards.md` §2.4). This Harness template is kept unchanged for when one is added. Agents must not generate backend code based on these defaults.

# Backend Standards

## Status

| Field                   | Value                  |
| ----------------------- | ---------------------- |
| Customized              | No                     |
| Applies to this project | _Confirm during setup_ |

---

## Technology Stack

Harness defaults (override during setup if your project differs — see `docs/base-standards.md` §2.4):

- Language and runtime: TypeScript, Node.js 20+
- Framework: **NestJS**
- Database and ORM: PostgreSQL + **Prisma**
- Testing framework and coverage target: **Jest**, ≥ 90% line coverage
- Notable libraries: class-validator, class-transformer, `@nestjs/swagger` (when API docs are required)

Replace the values above when `Customized` is set to `Yes`.

---

## Architecture

Harness default (override during setup):

- Pattern: Clean Architecture / DDD with NestJS modules
- Layer structure: **Presentation** (`@Controller`, DTOs, guards, pipes) → **Application** (`@Injectable` services) → **Domain** (entities, value objects, repository interfaces) → **Infrastructure** (Prisma repositories, external adapters)
- Dependency rules: domain does not import NestJS or Prisma; controllers stay thin and delegate to services

---

## API Design

_To be defined during Harness setup._

- API style (REST, GraphQL, gRPC):
- Versioning strategy:
- Request/response conventions:
- Error response format:
- Pagination, filtering, sorting:

See also: `docs/api-spec.yml`

---

## Database

_To be defined during Harness setup._

- Schema conventions:
- Migration strategy:
- Indexing guidelines:
- Transaction boundaries:

See also: `docs/data-model.md`

---

## Testing

_To be defined during Harness setup._

- Unit test patterns:
- Integration test patterns:
- Coverage target:
- Test data and fixtures:

---

## Error Handling and Logging

_To be defined during Harness setup._

- Error types and mapping to HTTP status codes:
- Structured logging format:
- Fields that must never appear in logs:

---

## Security

Follow `docs/security-standards.md` and run `/security-scan` before merging backend changes.

_Project-specific backend security rules (auth middleware, rate limits, etc.) to be defined during setup._

---

## Naming Conventions

_To be defined during Harness setup._

| Artifact                | Convention | Example |
| ----------------------- | ---------- | ------- |
| Files                   |            |         |
| Classes                 |            |         |
| Functions               |            |         |
| API routes              |            |         |
| Database tables/columns |            |         |

---

## Code Examples

_Add Before/After examples for patterns the team wants agents to follow._
