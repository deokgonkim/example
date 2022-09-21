#!/bin/bash

## if `jq` is installed
# aws secretsmanager get-secret-value \
# --secret-id ${APP_PREFIX}-${ENV} | \
# jq -r '.SecretString | fromjson | to_entries | map("\(.key)=\(.value|@sh)") | join("\n")'

## if `node` is installed

if [ -z "$SERVICE_PREFIX" -o -z "$SERVICE_NAME" -o -z "$STAGE" ]; then
    echo "ERROR=\"$SERVICE_PREFIX-$SERVICE_NAME-$STAGE not defined\""
    exit 1
fi

aws secretsmanager get-secret-value \
--secret-id ${SERVICE_PREFIX}-${SERVICE_NAME}-${STAGE}-secrets | \
node json-to-env.js
