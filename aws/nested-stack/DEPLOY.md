# Deploy Guide

This repo uses a parent CloudFormation stack that references a nested template.
You must upload the nested templates to S3 and pass their URLs as parameters.

## Prerequisites

- AWS CLI configured (`aws configure`)
- An S3 bucket to store the nested template
- Create `env.sh` from the sample `env.example.sh` and source it before running commands

```bash
cp env.example.sh env.sh
source env.sh
```

## Upload nested template

```bash
aws s3 cp nested/stack.yaml s3://$S3_BUCKET/$S3_PREFIX/nested/stack.yaml
aws s3 cp nested/dynamodb.yaml s3://$S3_BUCKET/$S3_PREFIX/nested/dynamodb.yaml
aws s3 cp nested/sns.yaml s3://$S3_BUCKET/$S3_PREFIX/nested/sns.yaml
aws s3 cp nested/sqs.yaml s3://$S3_BUCKET/$S3_PREFIX/nested/sqs.yaml
aws s3 cp template.yaml s3://$S3_BUCKET/$S3_PREFIX/template.yaml
```

## Deploy parent stack

```bash
aws cloudformation deploy \
  --stack-name products-stream-pipeline \
  --template-file template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    NestedTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/nested/stack.yaml \
    DynamoDbTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/nested/dynamodb.yaml \
    SnsTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/nested/sns.yaml \
    SqsTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/nested/sqs.yaml
```

## Update nested template

After editing `nested/stack.yaml`, re-upload it and run the deploy command again.

```bash
aws s3 cp nested/stack.yaml s3://$S3_BUCKET/$S3_PREFIX/stack.yaml
aws s3 cp nested/dynamodb.yaml s3://$S3_BUCKET/$S3_PREFIX/dynamodb.yaml
aws s3 cp nested/sns.yaml s3://$S3_BUCKET/$S3_PREFIX/sns.yaml
aws s3 cp nested/sqs.yaml s3://$S3_BUCKET/$S3_PREFIX/sqs.yaml
aws cloudformation deploy \
  --stack-name products-stream-pipeline \
  --template-file template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    NestedTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/stack.yaml \
    DynamoDbTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/dynamodb.yaml \
    SnsTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/sns.yaml \
    SqsTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/sqs.yaml
```

## Delete stack

```bash
aws cloudformation delete-stack --stack-name products-stream-pipeline
```
