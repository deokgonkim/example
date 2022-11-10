#!/bin/bash

source env.sh

#export PROJECT_NAME=hello-world
export PROJECT_DIR=../docker/

export TAG=latest

function fail() {
    echo $1
    exit 1
}

# login to registry
echo $PASSWORD | \
docker login --username $USERNAME --password-stdin $REGISTRY_URL || fail "Login Failed"

# build image
docker build -t $SERVICE_NAME:$TAG $PROJECT_DIR || fail "Build Failed"

# tag image
docker tag $SERVICE_NAME:$TAG $REGISTRY_URL/$SERVICE_PREFIX/$SERVICE_NAME:$TAG || fail "Tagging Failed"

# push image
docker push $REGISTRY_URL/$SERVICE_PREFIX/$SERVICE_NAME:$TAG || fail "Push Failed"

