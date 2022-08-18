#!/bin/bash

cmake -S ./src/ \
-B ./build/ \
-DCMAKE_BUILD_TYPE=Release \
-DCMAKE_PREFIX_PATH=./aws-lambda-cpp/build/bin
