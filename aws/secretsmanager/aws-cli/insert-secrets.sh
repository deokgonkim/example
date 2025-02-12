#!/bin/bash

if [ ! -f env.sh ]; then
    echo "Please provide env.sh first"
    exit 1
fi
source env.sh

aws secretsmanager put-secret-value \
--secret-id ${APP_PREFIX}-${ENV} \
--secret-string "$(./env-to-json.js .env)"
