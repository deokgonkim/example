#!/bin/bash

PROTOC_BIN=~/bin/protoc

if [ ! -d "src/generated" ]; then
  mkdir -p src/generated
fi

$PROTOC_BIN -I=./protos protos/*.proto \
--js_out=import_style=commonjs:src/generated \
--grpc-web_out=import_style=commonjs,mode=grpcwebtext:src/generated

