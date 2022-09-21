#!/bin/bash

if [ -z "$SERVICE_PREFIX" -o -z "$SERVICE_NAME" -o -z "$STAGE" ]; then
    echo "ERROR=\"$SERVICE_PREFIX-$SERVICE_NAME-$STAGE not defined\""
    exit 1
fi

aws secretsmanager get-secret-value \
--secret-id ${SERVICE_PREFIX}-${SERVICE_NAME}-${STAGE}-secrets | \
jq -r '.SecretString | fromjson | to_entries | map("\(.key)=\(.value|@sh)") | join("\n")'
