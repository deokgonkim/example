#!/bin/bash

export AWS_ACCOUNT_ID=$(aws sts get-caller-identity | jq -r .Account)

function fail() {
    echo $1
    exit 1
}

if [ ! -f env.sh ]; then
    echo "Please prepare env.sh file first"
    exit 1
fi
source env.sh
# read from env.sh
# PREFIX=
# SERVICE_NAME=
export TAG=latest
export SOURCE_PATH=../../front-api/

# AWS ECR LOGIN
aws ecr get-login-password --region ap-northeast-2 | \
docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com || \
fail "Failed to login"

# Build image
docker build -t $PREFIX/$SERVICE_NAME $SOURCE_PATH || \
fail "Failed to build"

# Tag image
docker tag $PREFIX/$SERVICE_NAME:$TAG ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/$PREFIX/$SERVICE_NAME:$TAG || \
fail "Failed to tag"

# Push image
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/$PREFIX/$SERVICE_NAME:$TAG || \
fail "Failed to push"
