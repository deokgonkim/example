#!/bin/bash

git clone https://github.com/aws/aws-sdk-cpp.git
cd aws-sdk-cpp
git submodule update --init --recursive
mkdir build
cd build
cmake .. -DBUILD_ONLY="s3;core" \
-DBUILD_SHARED_LIBS=OFF \
-DENABLE_UNITY_BUILD=ON \
-DCMAKE_BUILD_TYPE=Release \
-DCMAKE_INSTALL_PREFIX=../../bin
cd aws-cpp-sdk-core
make
make install
cd ..
cd aws-cpp-sdk-s3
make
make install
