#!/bin/bash

source env.sh

aws cloudformation \
deploy \
--stack-name aurora-serverless-posgresql \
--template-file ./cloudformation.yaml \
--parameter-overrides \
"EngineVersion=$ENGINE_VERSION" \
"DBName=$DB_NAME" \
"DBMasterUsername=$DB_MASTER_USERNAME" \
"VpcId=$VPC_ID" \
"ClientSecurityGroupId=$CLIENT_SECURITY_GROUP_ID" \
"VpcSecurityGroupId=$VPC_SECURITY_GROUP_ID" \
"SubnetsPrivate=$SUBNETS_PRIVATE" \
"HostedZoneId=$HOSTED_ZONE_ID" \
"HostedZoneName=$HOSTED_ZONE_NAME" \
"AlertTopicArn=$ALERT_TOPIC_ARN" \
"SecretArn=$SECRET_ARN"
