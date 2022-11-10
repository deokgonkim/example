#!/bin/bash

source env.sh

export CONTAINER_NAME=testcontainer2

az container logs \
--resource-group $RESOURCE_GROUP \
--name $CONTAINER_NAME

