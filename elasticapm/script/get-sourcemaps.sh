#!/bin/bash

# local env file (not git tracked)
# for ELASTIC_APM_KIBANA_URL, EC_API_KEY
# in AWS environment variables are set in Amplify > Hosting > Environment variables
set -o allexport
source .env.development.local
set +o allexport

curl -X GET ${ELASTIC_APM_KIBANA_URL}/api/apm/sourcemaps \
  -H "Authorization: ApiKey ${EC_API_KEY}" \
  -H "kbn-xsrf: true" \
  -o - | tee sourcemaps.json | jq -r '.artifacts[].id' > source_ids.txt
