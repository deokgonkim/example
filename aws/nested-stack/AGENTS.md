# Repository Guidelines

## Project Structure & Module Organization

This repository contains CloudFormation templates for a DynamoDB stream pipeline. Key paths:

- `template.yaml`: parent stack that wires nested templates.
- `nested/stack.yaml`: main nested stack that connects DynamoDB, SNS, SQS, and Lambda.
- `nested/dynamodb.yaml`, `nested/sns.yaml`, `nested/sqs.yaml`: service-specific nested templates.
- `DEPLOY.md`: deployment steps and CLI examples.

Keep new infrastructure templates in `nested/` and surface them through `template.yaml` if they are part of the deployment.

## Architecture Overview

The pipeline captures DynamoDB stream events and fans out to downstream processing:

```
DynamoDB (ProductsTable) -> Stream -> Lambda (StreamToSns) -> SNS (UpdatesTopic)
  -> SQS (UpdatesQueue) -> Lambda (QueueProcessor)
```

## Build, Test, and Development Commands

There is no build system. Use AWS CLI for deployment:

- `aws s3 cp nested/stack.yaml s3://YOUR_BUCKET/nested/stack.yaml`: upload nested templates.
- `aws cloudformation deploy --stack-name products-stream-pipeline --template-file template.yaml --capabilities CAPABILITY_NAMED_IAM --parameter-overrides ...`: deploy the parent stack.
- `aws cloudformation delete-stack --stack-name products-stream-pipeline`: remove all resources.

See `DEPLOY.md` for complete command sequences and parameter examples.

## Coding Style & Naming Conventions

- YAML uses 2-space indentation.
- Resource names use `PascalCase` (e.g., `ProductsTable`, `UpdatesTopic`).
- Filenames are `kebab-case` only when required by AWS, otherwise prefer lowercase with `.yaml`.
- Inline Lambda code is Python; keep handlers small and focused.

## Testing Guidelines

No automated tests are configured. Validate templates with `aws cloudformation validate-template` before deploying. If tests are added later, document frameworks and naming conventions here.

## Commit & Pull Request Guidelines

Git history does not show a consistent convention. Use clear, scoped messages (e.g., `feat: add sns nested template`, `fix: tighten sqs policy`). PRs should include a brief description, linked issues if applicable, and deployment or validation notes.

## Security & Configuration Tips

Do not commit credentials. Use AWS CLI profiles and environment variables (`AWS_PROFILE`, `AWS_REGION`). Ensure the S3 bucket for nested templates is in the target region.
