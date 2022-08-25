#!/bin/bash

docker run \
     --rm \
     --volume "$(pwd)/:/src" \
     --workdir "/src/" \
     --platform x86_64 \
     swift-lambda \
     swift build --product swift-lambda -c release

