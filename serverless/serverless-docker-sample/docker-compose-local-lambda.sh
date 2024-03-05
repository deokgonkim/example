#!/bin/bash

# export SENTRY_AUTH_TOKEN=$(cat .sentryclirc | grep token | sed s/"token="//)
export VERSION=$(git describe --tags || git rev-parse HEAD)

docker-compose -f docker-compose.lambda.yml build \
--build-arg VERSION=$VERSION
# --build-arg SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN \

docker-compose -f docker-compose.lambda.yml up

