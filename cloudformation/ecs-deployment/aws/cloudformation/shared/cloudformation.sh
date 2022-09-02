#!/bin/bash

source env.sh

export ECR_REPOSITORY_NAME=$PREFIX/$SERVICE_NAME

aws cloudformation \
deploy \
--stack-name ${SERVICE_NAME}-shared \
--template-file ./cloudformation.yml \
--capabilities CAPABILITY_NAMED_IAM \
--parameter-overrides \
"ServiceName=$SERVICE_NAME" \
"ECRRepositoryName=$ECR_REPOSITORY_NAME"
