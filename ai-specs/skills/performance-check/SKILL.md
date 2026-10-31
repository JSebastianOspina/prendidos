---
name: performance-check
description: Detect performance anti-patterns in backend (N+1 queries, missing pagination), frontend (bundle size, unnecessary re-renders), and serverless (Lambda cold start, over-provisioned memory). Use before release branches.
author: UBITS
version: 1.0.0
---

# performance-check Skill

Use before merging to a release branch or when a change is suspected to introduce performance regressions.

## Instructions

Run a performance analysis on: $ARGUMENTS (defaults to current diff).

### Phase 1 — Backend: Query Performance

Check NestJS/Prisma/TypeORM code for:

**N+1 Query Detection**

- Loops that call a database query per iteration (classic N+1)
- Missing `include` / `relations` for related data that is accessed after the query
- Multiple sequential queries that could be combined into one

```typescript
// ❌ N+1 pattern
const courses = await courseRepo.findAll();
for (const course of courses) {
  course.enrollments = await enrollmentRepo.findByCourse(course.id); // N queries
}

// ✅ Single query with relation
const courses = await prisma.course.findMany({ include: { enrollments: true } });
```

**Missing Pagination**

- Endpoints that return collections without `limit`/`offset` or cursor pagination
- Any query that could return unbounded results in production

**Missing Indexes**

- Foreign key columns used in WHERE clauses without an index
- Columns used in ORDER BY or GROUP BY without an index

### Phase 2 — Frontend: Bundle and Rendering

Check React/single-spa code for:

**Bundle Size**

- Large library imports that should be tree-shaken: `import _ from 'lodash'` → `import get from 'lodash/get'`
- Heavy dependencies added without justification
- Synchronous imports of components that should be lazy-loaded across micro-frontend boundaries

**Unnecessary Re-renders**

- Components using object or array literals in JSX props (creates new reference on every render)
- Missing `useMemo` or `useCallback` on expensive computations passed as props
- Context providers that trigger wide re-renders on unrelated state changes

**`@flux-ui/core` Usage**

- Using `@flux-ui/core` components correctly — not wrapping them in extra DOM elements unnecessarily
- Not duplicating functionality already in `@flux-ui/core` with custom implementations

### Phase 3 — Serverless: Lambda Performance

Check Lambda functions for:

**Cold Start Anti-Patterns**

- SDK client initialization inside the handler function body (should be at module scope)
- Large bundle sizes > 5 MB (check `esbuild` output)
- Unnecessary imports at the handler level

**Memory Misconfiguration**

- Lambda memory set to minimum (128 MB) for CPU-intensive operations (more memory = more CPU)
- Timeout too low for the actual operation duration (causes silent failures)

**SQS Batch Processing**

- Processing SQS records sequentially when `Promise.allSettled` would parallelize them
- Missing `batchSize` and `maximumBatchingWindow` optimization on event source mapping

### Output Format

```
## Performance Check Report

### Backend Queries — [PASS / ISSUES]
[N+1 findings, missing pagination, missing indexes — with file:line]

### Frontend Bundle/Rendering — [PASS / ISSUES / N/A]
[Bundle and re-render findings]

### Lambda Performance — [PASS / ISSUES / N/A]
[Cold start, memory, batch processing findings]

### Verdict
[PASS] OR [REQUIRES CHANGES: prioritized list of issues]
```

## Notes

- Performance issues do not block PRs by default unless they are severe (unbounded queries on high-traffic endpoints).
- Flag severe issues as HIGH, moderate ones as MODERATE.
- Always suggest the fix, not just the problem.
