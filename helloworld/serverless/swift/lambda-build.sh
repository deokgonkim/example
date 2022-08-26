#!/bin/bash

docker run \
     --rm \
     --volume "$(pwd)/:/src" \
     --workdir "/src/" \
     --platform linux/amd64 \
     swift-lambda \
     swift build --product swift-lambda --static-swift-stdlib -c release

