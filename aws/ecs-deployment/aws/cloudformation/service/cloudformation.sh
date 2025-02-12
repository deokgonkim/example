#!/bin/bash

source env.sh
# export PREFIX=
# export SERVICE_NAME=
# export STAGE=
# export VPC_ID=
# export PUBLIC_SUBNET1=
# export PUBLIC_SUBNET2=
# export SECURITY_GROUP_PUBLIC=
# export SECURITY_GROUP_VPC=
# export CERTIFICATE_ARN=
# export HOSTED_ZONE_ID=
# export HOSTED_ZONE_NAME=
# export SUB_DOMAIN_NAME=


export ECR_REPOSITORY_NAME=$PREFIX/$SERVICE_NAME

export DEPLOYMENT_VERSION=$(git describe || git rev-parse HEAD)

echo "Deploying ${DEPLOYMENT_VERSION}"

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
"SecurityGroupPublic=$SECURITY_GROUP_PUBLIC" \
"SecurityGroupVpc=$SECURITY_GROUP_VPC" \
"CertificateArn=$CERTIFICATE_ARN" \
"HostedZoneId=$HOSTED_ZONE_ID" \
"HostedZoneName=$HOSTED_ZONE_NAME" \
"SubDomainName=$SUB_DOMAIN_NAME" \
"ECRRepositoryName=$ECR_REPOSITORY_NAME" \
"DeploymentVersion=$DEPLOYMENT_VERSION"
