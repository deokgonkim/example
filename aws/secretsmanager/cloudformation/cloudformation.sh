#!/bin/bash

if [ ! -f env.sh ]; then
    echo "Please provide env.sh first"
    exit 1
fi
source env.sh

export STACK_NAME=${APP_PREFIX}-${ENV}-secrets

aws cloudformation deploy \
--template-file ./cloudformation.yml \
--stack-name $STACK_NAME \
--parameter-overrides \
"SecretsName=${APP_PREFIX}-${ENV}"
