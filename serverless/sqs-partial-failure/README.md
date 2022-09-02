# sqs-partial-failure

This example tests `Lambda` function handles `SQS` message. and some of them are failed to process.

Normally, when `lambda` has failed to execute(ex. throws Error), AWS SQS will send the event again.
But, when `SQS` batch size is specified, there can be a case only some message should be handled again.

This example tests that case.

## Deploy

```bash
npm run deploy-dev
```

## References

- https://www.serverless.com/blog/improved-sqs-batch-error-handling-with-aws-lambda
- https://www.serverless.com/blog/aws-lambda-sqs-serverless-integration
- https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
