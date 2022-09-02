#!/bin/bash

aws secretsmanager get-secret-value \
--secret-id ${SERVICE_NAME}-${STAGE} | \
jq -r '.SecretString | fromjson | to_entries | map("export \(.key)=\(.value|@sh)") | join("\n")' > ./.env.sh

source .env.sh

echo "# Loaded environments"
env
