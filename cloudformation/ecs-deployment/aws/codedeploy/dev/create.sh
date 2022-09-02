#!/bin/bash

# source env.sh
source ../../cloudformation/dev/env.sh


# time to wait before terminate OLD containers
export WAIT_MINUTE=10

export SERVICE_ROLE_ARN=$(aws iam get-role --role-name CodeDeployServiceRole | jq -r .Role.Arn)
export LB_ARN=$(aws elbv2 describe-load-balancers --names ${SERVICE_NAME}-${STAGE} | jq -r ".LoadBalancers[0].LoadBalancerArn")
export LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn ${LB_ARN} | jq -r ".Listeners[0].ListenerArn")

# aws deploy create-application \
# --application-name ${SERVICE_NAME}-${STAGE} \
# --compute-platform ECS

aws deploy create-deployment-group \
--application-name ${SERVICE_NAME}-${STAGE} \
--deployment-group-name ${SERVICE_NAME}-${STAGE}-dg \
--service-role-arn $SERVICE_ROLE_ARN \
--deployment-style "deploymentType=BLUE_GREEN,deploymentOption=WITH_TRAFFIC_CONTROL" \
--blue-green-deployment-configuration "terminateBlueInstancesOnDeploymentSuccess={action=TERMINATE,terminationWaitTimeInMinutes=${WAIT_MINUTE}},deploymentReadyOption={actionOnTimeout=CONTINUE_DEPLOYMENT}" \
--ecs-services "serviceName=${SERVICE_NAME}-${STAGE},clusterName=$SERVICE_NAME-${STAGE}-cluster" \
--load-balancer-info "targetGroupPairInfoList=[{targetGroups=[{name=${SERVICE_NAME}-${STAGE}-tg1},{name=${SERVICE_NAME}-${STAGE}-tg2}],prodTrafficRoute={listenerArns=[${LISTENER_ARN}]}}]"
