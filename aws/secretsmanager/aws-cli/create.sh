#!/bin/bash

if [ ! -f env.sh ]; then
    echo "Please provide env.sh first"
    exit 1
fi
source env.sh

aws secretsmanager create-secret \
--name ${APP_PREFIX}-${ENV}
