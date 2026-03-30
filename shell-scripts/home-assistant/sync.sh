#!/bin/bash

BUCKET_NAME=bucket_name
AWS_ACCESS_KEY_ID=keyid
AWS_SECRET_ACCESS_KEY=secretaccesskey
AWS_REGION=ap-northeast-2

echo "Sync" `date` | tee -a /media/sync.log

if [ ! -f "/usr/bin/aws" ]; then
echo "Installing aws" | tee -a /media/sync.log
apk add aws-cli 2>&1 | tee -a /media/sync.log
fi

echo `id` | tee -a /media/sync.log

aws s3 sync \
/media/body-detected/ \
s3://$BUCKET_NAME/body-detected/ 2>&1 \
| tee -a /media/sync.log

