#!/bin/bash

if [ -e env.sh ]; then
    source ./env.sh
else
    echo "Please create env.sh first"
    exit 1
fi

export FUNCTION_NAME=cpp-lambda-hello

aws lambda delete-function \
--function-name $FUNCTION_NAME
