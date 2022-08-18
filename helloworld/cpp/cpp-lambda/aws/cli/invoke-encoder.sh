#!/bin/bash

echo "BUCKET_NAME"; read BUCKET_NAME; export BUCKET_NAME
echo "KEY"; read KEY; export KEY

aws lambda invoke \
--function-name cpp-lambda-encoder \
--payload '
{"s3bucket": "'$BUCKET_NAME'", "s3key": "'$KEY'" }
' \
output.txt