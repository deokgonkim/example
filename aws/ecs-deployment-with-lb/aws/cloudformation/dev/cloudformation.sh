#!/bin/bash

source env.sh
# export PREFIX=
# export SERVICE_NAME=
# export STAGE=
# export VPC_ID=
# export PUBLIC_SUBNET1=
# export PUBLIC_SUBNET2=
# export PUBLIC_LOAD_BALANCER_SG=
# export CERTIFICATE_ARN=
# export HOSTED_ZONE_ID=
# export HOSTED_ZONE_NAME=
# export SUB_DOMAIN_NAME=


export ECR_REPOSITORY_NAME=$PREFIX/$SERVICE_NAME

aws cloudformation \
deploy \
--stack-name ${SERVICE_NAME}-${STAGE} \
--template-file ./cloudformation.yml \
--capabilities CAPABILITY_NAMED_IAM \
--parameter-overrides \
"ServiceName=$SERVICE_NAME" \
"Stage=$STAGE" \
"VpcId=$VPC_ID" \
"PublicSubnet1=$PUBLIC_SUBNET1" \
"PublicSubnet2=$PUBLIC_SUBNET2" \
"PublicLoadBalancerSG=$PUBLIC_LOAD_BALANCER_SG" \
"CertificateArn=$CERTIFICATE_ARN" \
"HostedZoneId=$HOSTED_ZONE_ID" \
"HostedZoneName=$HOSTED_ZONE_NAME" \
"SubDomainName=$SUB_DOMAIN_NAME" \
"ECRRepositoryName=$ECR_REPOSITORY_NAME"
