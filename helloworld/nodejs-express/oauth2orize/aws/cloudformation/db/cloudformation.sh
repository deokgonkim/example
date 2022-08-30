#!/bin/bash

source env.sh

aws cloudformation \
deploy \
--stack-name aurora-serverless-posgresql \
--template-file ./cloudformation.yaml \
--parameter-overrides \
"AppId=$APP_ID" \
"Stage=$STAGE"
