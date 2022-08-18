#!/bin/bash

if [ -d build ]; then
    echo "Removing ./build directory"
    rm -Rf ./build
fi

cmake -S ./src/ \
-B ./build/ \
-DCMAKE_BUILD_TYPE=Release \
-DCMAKE_PREFIX_PATH=$(pwd)/bin

cd build/
make aws-lambda-package-hello
