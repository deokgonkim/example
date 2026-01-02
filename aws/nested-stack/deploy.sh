#!/bin/bash

if [ ! -f "env.sh" ]; then
    echo "env.sh file not found! Please create it from env.example.sh"
    exit 1
fi

source ./env.sh

aws s3 cp nested/stack.yaml s3://$S3_BUCKET/$S3_PREFIX/nested/stack.yaml
aws s3 cp nested/dynamodb.yaml s3://$S3_BUCKET/$S3_PREFIX/nested/dynamodb.yaml
aws s3 cp nested/sns.yaml s3://$S3_BUCKET/$S3_PREFIX/nested/sns.yaml
aws s3 cp nested/sqs.yaml s3://$S3_BUCKET/$S3_PREFIX/nested/sqs.yaml
aws s3 cp template.yaml s3://$S3_BUCKET/$S3_PREFIX/template.yaml

aws cloudformation deploy \
  --stack-name products-stream-pipeline \
  --template-file template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    NestedTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/nested/stack.yaml \
    DynamoDbTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/nested/dynamodb.yaml \
    SnsTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/nested/sns.yaml \
    SqsTemplateUrl=https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$S3_PREFIX/nested/sqs.yaml
