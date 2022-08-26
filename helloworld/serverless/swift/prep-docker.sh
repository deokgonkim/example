#!/bin/bash

# this script will prepare `swift-lambda` docker image based on `Dockerfile`

docker build --platform linux/amd64 -t swift-lambda:latest .
