#!/bin/bash

source env.sh
# export PREFIX=
# export SERVICE_NAME=
# export STAGE=
# export ELB_NAME=

aws cloudformation \
deploy \
--stack-name ${SERVICE_NAME}-${STAGE}-codedeploy \
--template-file ./cloudformation.yml \
--capabilities CAPABILITY_NAMED_IAM \
--parameter-overrides \
"Prefix=$PREFIX" \
"ServiceName=$SERVICE_NAME" \
"Stage=$STAGE" \
"ElbName=$ELB_NAME"
