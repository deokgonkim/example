#!/bin/bash

if [ ! -f ../../cloudformation/dev/env.sh ]; then
    echo "prepare ../cloudformation/dev.env.sh first"
    exit 1
fi
source ../../cloudformation/dev/env.sh

TASK_DEFINITION_ARN=$(aws ecs describe-task-definition --task-definition ${SERVICE_NAME}-${STAGE} | jq -r .taskDefinition.taskDefinitionArn)

if [ ! -f ./env.service.sh ]; then
    echo "prepare env.service.sh first"
    exit 1
fi
source ./env.service.sh
# TARGET_GROUP_ARN=
# LOAD_BALANCER_NAME=
# CONTAINER_NAME=
# CONTAINER_PORT=
# PRIVATE_SUBNET1=
# PRIVATE_SUBNET2=
# PRIVATE_SECURITY_GROUP1=

# if ECS container is deployed to public subnet, public ip is required to access Internet
export ASSIGN_PUBLIC_IP=ENABLED
# if ECS container is deployed to private subnet, public ip is not required
# export ASSIGN_PUBLIC_IP=DISABLED

aws ecs create-service \
--cluster ${SERVICE_NAME}-${STAGE}-cluster \
--service-name ${SERVICE_NAME}-${STAGE} \
--task-definition ${TASK_DEFINITION_ARN} \
--load-balancers "targetGroupArn=${TARGET_GROUP_ARN},containerName=${CONTAINER_NAME},containerPort=${CONTAINER_PORT}" \
--launch-type FARGATE \
--desired-count 1 \
--network-configuration "awsvpcConfiguration={subnets=[${PRIVATE_SUBNET1},${PRIVATE_SUBNET2}],securityGroups=[${PRIVATE_SECURITY_GROUP1}],assignPublicIp=${ASSIGN_PUBLIC_IP}}" \
--deployment-controller "type=CODE_DEPLOY"
