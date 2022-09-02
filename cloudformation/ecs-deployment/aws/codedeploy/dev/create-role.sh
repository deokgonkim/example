#!/bin/bash

aws iam create-role \
--role-name CodeDeployServiceRole \
--assume-role-policy-document file://create-role-trust.json

aws iam attach-role-policy \
--role-name CodeDeployServiceRole \
--policy-arn arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS
