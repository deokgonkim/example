#!/bin/bash

source env.sh

export TAG=latest

# TODO run 명령은 뭘 하는 것인지 잘 모르겠다.

az acr run --registry $REGISTRY_NAME \
--cmd '$Registry/'$SERVICE_PREFIX/$SERVICE_NAME:$TAG /dev/null

