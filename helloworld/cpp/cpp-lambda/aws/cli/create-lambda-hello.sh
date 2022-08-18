#!/bin/bash

if [ -e env.sh ]; then
    source ./env.sh
else
    echo "Please create env.sh first"
    exit 1
fi

export FUNCTION_NAME=cpp-lambda-hello

aws lambda create-function \
--function-name $FUNCTION_NAME \
--role $CPP_LAMBDA_ROLE_ARN \
--runtime provided \
--timeout 15 \
--memory-size 128 \
--handler hello \
--zip-file fileb://../../build/hello.zip
