#!/bin/bash

docker run \
     --rm \
     --volume "$(pwd)/:/src" \
     --workdir "/src/" \
     --platform linux/amd64 \
     -it \
     swift-lambda

