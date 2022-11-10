#!/bin/bash

source env.sh

export CONTAINER_NAME=testcontainer5

export TAG=latest

az container \
create \
--resource-group $RESOURCE_GROUP \
--name $CONTAINER_NAME \
--registry-username $REGISTRY_NAME \
--image $REGISTRY_URL/$SERVICE_PREFIX/$SERVICE_NAME:$TAG \
--dns-name-label dgkimtestcontainer5 \
--ports 80 \
--command-line "bash -c \"echo Helllllo\"" \
--restart-policy Never

#--registry-login-server $REGISTRY_URL \
