---
description: Serverless standards for cloud functions, queues, events, and infrastructure-as-code. Customize or delete if the project has no serverless layer.
globs: ['**/serverless/**', '**/lambdas/**', '**/cdk/**', '**/functions/**']
alwaysApply: false
---

> **Not applicable yet** — Prendidos has no serverless layer today (see `docs/base-standards.md` §2.4). This Harness template is kept unchanged for when one is added. Agents must not generate serverless layer code based on these defaults.

# Serverless Standards

## Status

| Field          | Value           |
| -------------- | --------------- |
| Customized     | No              |
| Cloud provider | _To be defined_ |

---

## Technology Stack

_To be defined during Harness setup._

- Runtime and language:
- Compute (Lambda, Cloud Functions, etc.):
- Messaging (SQS, Pub/Sub, etc.):
- Event bus (EventBridge, etc.):
- Infrastructure as code (CDK, Terraform, SAM, etc.):
- Observability libraries:

---

## Handler Patterns

_To be defined during Harness setup._

- Standard handler structure:
- Thin handler vs. service delegation:
- Error handling and response format:

---

## Queue and Event Patterns

_To be defined during Harness setup._

- Message validation:
- Dead-letter queue policy:
- Partial batch failure handling:
- Event naming convention:

---

## Infrastructure

_To be defined during Harness setup._

- Stack organization:
- Tagging requirements:
- Secret injection (no hardcoded env secrets):
- Memory, timeout, and concurrency defaults:

---

## IAM and Security

_To be defined during Harness setup._

- Least-privilege rules per function:
- Review process for IAM changes:

---

## Observability

_To be defined during Harness setup._

- Structured logging:
- Metrics and alarms:
- Tracing:

---

## Testing

_To be defined during Harness setup._

- Unit tests for business logic:
- Handler tests:
- Integration / LocalStack / sandbox approach:

---

## Naming Conventions

_To be defined during Harness setup._

| Resource   | Pattern | Example |
| ---------- | ------- | ------- |
| Function   |         |         |
| Queue      |         |         |
| Event type |         |         |
| Stack      |         |         |
