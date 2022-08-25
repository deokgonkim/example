#!/bin/bash

# this script will create `swift-lambda.zip` archive file. that is built using `lambda-build.sh`

docker run \
     --rm \
     --volume "$(pwd)/:/src" \
     --workdir "/src/" \
     --platform x86_64 \
     swift-lambda \
     ./package.sh swift-lambda
