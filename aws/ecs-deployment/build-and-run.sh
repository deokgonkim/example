#!/bin/bash

API_VERSION=$(git describe || git rev-parse HEAD)

docker-compose build --build-arg API_VERSION=$API_VERSION

docker-compose up
