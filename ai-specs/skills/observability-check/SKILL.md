---
name: observability-check
description: Verify that new features have proper observability — structured logging, error tracking, CloudWatch metrics for Lambdas, and distributed tracing. Use before release branches.
author: UBITS
version: 1.0.0
---

# observability-check Skill

Use before merging to a release branch to ensure new features produce the signals needed to monitor them in production.

## Instructions

Check observability coverage for: $ARGUMENTS (defaults to current diff).

### Phase 1 — Structured Logging

**Backend (NestJS)**

Check that:

- All service-level operations log their start and completion at `info` level
- Errors are logged at `error` level with the full error object (not just `error.message`)
- Logs include enough context to trace a request: `userId`, `resourceId`, `action`
- No sensitive data in logs: passwords, tokens, PII, credit card numbers
- Using the project's logger module — not `console.log`

```typescript
// ✅ Good structured log
this.logger.log('Enrollment created', { userId, courseId, enrollmentId });

// ❌ Bad
console.log('done');
this.logger.error('failed'); // missing error object and context
```

**Lambda (Powertools)**

Check that:

- `@aws-lambda-powertools/logger` is used — not `console.log`
- Each handler logs the incoming event shape (not the full event if it contains PII)
- Each record in an SQS consumer logs the `messageId`
- Errors are logged with the full error and a meaningful message

### Phase 2 — Error Tracking

Verify:

- Unhandled exceptions are caught and logged before returning a 500 response
- The error includes: error type, message, stack trace, and request context
- Integration failures (external API calls, DB errors) are logged with the upstream error

### Phase 3 — CloudWatch Metrics (Lambda only)

Check that new Lambda functions:

- Emit at least one custom business metric via `@aws-lambda-powertools/metrics`
  - Example: `enrollments_processed`, `notifications_sent`
- Have a CloudWatch alarm configured for DLQ message count > 0
- Have a CloudWatch alarm on error rate > threshold (via CDK)

### Phase 4 — Distributed Tracing (integration-heavy functions)

For Lambda functions that call multiple services or downstream APIs:

- `@aws-lambda-powertools/tracer` should be enabled
- X-Ray subsegments should wrap external calls (DB, HTTP, SQS publish)

### Output Format

```
## Observability Report

### Structured Logging — [PASS / ISSUES]
[Missing logs, wrong log levels, sensitive data in logs — with file:line]

### Error Tracking — [PASS / ISSUES]
[Unhandled exceptions or swallowed errors]

### CloudWatch Metrics — [PASS / ISSUES / N/A]
[Missing business metrics or alarms on new Lambda functions]

### Distributed Tracing — [PASS / ISSUES / N/A]
[Missing tracer on integration-heavy functions]

### Verdict
[PASS] OR [REQUIRES CHANGES: list issues]
```

## Notes

- "No logs" is a blocker for production deployment. A feature you can't observe is a feature you can't support.
- Metrics and tracing are strongly recommended but not hard blockers unless the function handles critical business operations.
- Review `docs/serverless-standards.md` Observability section for the full UBITS logging standards.
