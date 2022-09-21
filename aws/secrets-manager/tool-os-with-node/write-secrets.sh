#!/bin/bash

if [ -z "$2" ]; then
    echo "Usage: ./write-secrets.sh {STAGE} {DOTENV_FILE}"
    exit 1
fi

if [ -z "$1" ]; then
    echo "Usage: ./write-secrets.sh {STAGE} {DOTENV_FILE}"
    exit 1
fi

export ENV_DIR="../aws/cloudformation/$1"

if [ ! -e "$ENV_DIR/env.sh" ]; then
    echo "Failed to locate environment configuration using $ENV_DIR/env.sh"
    exit 1
fi

if [ ! -e "$2" ]; then
    echo "Could not find file $2"
    exit 1
fi

source $ENV_DIR/env.sh

aws secretsmanager put-secret-value \
--secret-id ${SERVICE_PREFIX}-${SERVICE_NAME}-${STAGE}-secrets \
--secret-string "$(./env-to-json.js $2)"
