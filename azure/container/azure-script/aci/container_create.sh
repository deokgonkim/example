#!/bin/bash

source env.sh

export CONTAINER_NAME=testcontainer2

export TAG=latest

az container \
create \
--resource-group $RESOURCE_GROUP \
--name $CONTAINER_NAME \
--registry-username $REGISTRY_NAME \
--image $REGISTRY_URL/$SERVICE_PREFIX/$SERVICE_NAME:$TAG \
--dns-name-label dgkimtestcontainer2 \
--ports 80

#--registry-login-server $REGISTRY_URL \
