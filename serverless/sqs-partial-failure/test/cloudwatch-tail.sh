#!/bin/bash

export STAGE=dev

aws logs tail --follow /aws/lambda/example-sqs-partial-failure-${STAGE}-handler
