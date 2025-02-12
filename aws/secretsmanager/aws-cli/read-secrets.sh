#!/bin/bash

if [ ! -f env.sh ]; then
    echo "Please provide env.sh first"
    exit 1
fi
source env.sh

## if `jq` is installed
# aws secretsmanager get-secret-value \
# --secret-id ${APP_PREFIX}-${ENV} | \
# jq -r '.SecretString | fromjson | to_entries | map("\(.key)=\(.value|@sh)") | join("\n")'

## if `node` is installed
aws secretsmanager get-secret-value \
--secret-id ${APP_PREFIX}-${ENV} | \
node json-to-env.js
