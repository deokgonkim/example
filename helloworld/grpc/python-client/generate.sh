#!/bin/bash

# this generates python stub from proto file

# export OUT_PATH=./my_client
export OUT_PATH=./

python3 -m grpc_tools.protoc \
-I./protos \
--python_out=$OUT_PATH \
--pyi_out=$OUT_PATH \
--grpc_python_out=$OUT_PATH \
./protos/*.proto
