#!/bin/bash

docker run \
     --rm \
     --volume "$(pwd)/:/src" \
     --workdir "/src/" \
     --platform x86_64 \
     -it \
     swift-lambda

