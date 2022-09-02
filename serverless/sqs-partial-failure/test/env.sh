export STAGE=dev
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity | jq -r .Account)
export AWS_REGION=ap-northeast-2
export QUEUE_URL=https://sqs.${AWS_REGION}.amazonaws.com/${AWS_ACCOUNT_ID}/ExampleSQS-${STAGE}
