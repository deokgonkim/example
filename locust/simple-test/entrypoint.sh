#!/bin/bash

if [ -z "$1" ]; then
    echo "Running default script"
    locust
else
    echo "Running $@"
    exec "$@"
fi
