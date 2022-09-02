#!/bin/bash

aws secretsmanager get-secret-value \
--secret-id ${SERVICE_NAME}-${STAGE} | \
jq -r '.SecretString | fromjson | to_entries | map("\(.key)=\(.value|@sh)") | join("\n")' > ./.env

echo "# Loaded environments"
env
