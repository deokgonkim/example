#!/bin/bash

# local env file (not git tracked)
# for ELASTIC_APM_KIBANA_URL, EC_API_KEY
# in AWS environment variables are set in Amplify > Hosting > Environment variables
set -o allexport
source .env.development.local
set +o allexport

SOURCEMAP_ID=$1

if [ -z "$SOURCEMAP_ID" ]; then
  for SOURCEMAP_ID in $(cat ./source_ids.txt)
    do
      echo $SOURCEMAP_ID      
      curl -X DELETE ${ELASTIC_APM_KIBANA_URL}/api/apm/sourcemaps/$SOURCEMAP_ID \
        -H "Authorization: ApiKey ${EC_API_KEY}" \
        -H "kbn-xsrf: true"
    done
else
  curl -X DELETE ${ELASTIC_APM_KIBANA_URL}/api/apm/sourcemaps/$SOURCEMAP_ID \
    -H "Authorization: ApiKey ${EC_API_KEY}" \
    -H "kbn-xsrf: true"
fi
