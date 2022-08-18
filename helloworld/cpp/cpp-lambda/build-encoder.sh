#!/bin/bash

if [ -d build-encoder ]; then
    echo "Removing ./build directory"
    rm -Rf ./build-encoder
fi

cmake -S ./encoder/ \
-B ./build-encoder/ \
-DCMAKE_BUILD_TYPE=Release \
-DCMAKE_PREFIX_PATH=$(pwd)/bin

cd build-encoder/
make aws-lambda-package-cpp-lambda-encoder
