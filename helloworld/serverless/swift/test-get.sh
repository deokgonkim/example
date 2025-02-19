#!/bin/bash

set -o allexport
source ./.env
set +o allexport

export API_URL=https://${DOMAIN_NAME}/

curl -v -X GET $API_URL?name=dgkim
