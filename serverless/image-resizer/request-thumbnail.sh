#!/bin/bash

export STAGE=dev

export ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
export SQS_URL=https://sqs.ap-northeast-2.amazonaws.com/${ACCOUNT_ID}/ImageResizeQueue-${STAGE}

aws sqs send-message \
--queue-url $SQS_URL \
--message-body file://./request-thumbnail.json
# "$(cat ./request-thumbnail.json)"
