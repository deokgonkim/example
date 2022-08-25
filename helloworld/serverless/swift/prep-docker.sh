#!/bin/bash

# this script will prepare `swift-lambda` docker image based on `Dockerfile`

docker build --platform x86_64 -t swift-lambda .
