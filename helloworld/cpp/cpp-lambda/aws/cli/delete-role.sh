#!/bin/bash

export CPP_LAMBDA_ROLE_NAME=cpp-lambda-role

aws iam detach-role-policy \
--role-name $CPP_LAMBDA_ROLE_NAME \
--policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

aws iam detach-role-policy \
--role-name $CPP_LAMBDA_ROLE_NAME \
--policy-arn arn:aws:iam::aws:policy/AWSOpsWorksCloudWatchLogs

aws iam delete-role \
--role-name $CPP_LAMBDA_ROLE_NAME
