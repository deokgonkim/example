#!/bin/bash

# loading environment from AWS Secrets Manager or ...
echo "Loading environments"
source get-env.sh

echo "Starting Server"
npm start
