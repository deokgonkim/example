#!/bin/bash

source env.sh

#export PROJECT_NAME=hello-world
export PROJECT_DIR=../docker

export TAG=latest

function fail() {
    echo $1
    exit 1
}

az acr build \
--image $SERVICE_PREFIX/$SERVICE_NAME:$TAG \
--registry $REGISTRY_NAME \
--file $PROJECT_DIR/Dockerfile $PROJECT_DIR

