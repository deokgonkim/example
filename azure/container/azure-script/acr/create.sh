#!/bin/bash

source env.sh

export NAME=dgkimtestregistry1
export SKU=Standard

az acr \
create \
--resource-group $RESOURCE_GROUP \
--name $NAME \
--sku $SKU

