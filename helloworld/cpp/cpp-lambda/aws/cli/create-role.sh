#!/bin/bash

export CPP_LAMBDA_ROLE_NAME=cpp-lambda-role

export CPP_LAMBDA_ROLE_ARN=$(aws iam create-role \
--role-name $CPP_LAMBDA_ROLE_NAME \
--assume-role-policy-document file://create-role-trust-policy.json \
| jq -r .Role.Arn)

aws iam attach-role-policy \
--role-name cpp-lambda-role \
--policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

aws iam attach-role-policy \
--role-name cpp-lambda-role \
--policy-arn arn:aws:iam::aws:policy/AWSOpsWorksCloudWatchLogs

env | grep ^CPP_LAMBDA | sed s/^/export\ / | tee env.sh
