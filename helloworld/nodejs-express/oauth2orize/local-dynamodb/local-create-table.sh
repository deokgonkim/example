#!/bin/bash

source env.sh

# Users
./local-dynamodb.sh create-table \
--table-name ${APP_ID}-Users-${STAGE} \
--attribute-definitions AttributeName=id,AttributeType=S \
--key-schema AttributeName=id,KeyType=HASH \
--billing-mode PAY_PER_REQUEST

# AccessTokens
./local-dynamodb.sh create-table \
--table-name ${APP_ID}-OAuth2-AccessTokens-${STAGE} \
--attribute-definitions AttributeName=id,AttributeType=S \
--key-schema AttributeName=id,KeyType=HASH \
--billing-mode PAY_PER_REQUEST

# AuthorizationCodes
./local-dynamodb.sh create-table \
--table-name ${APP_ID}-OAuth2-AuthorizationCodes-${STAGE} \
--attribute-definitions AttributeName=id,AttributeType=S \
--key-schema AttributeName=id,KeyType=HASH \
--billing-mode PAY_PER_REQUEST

# Clients
./local-dynamodb.sh create-table \
--table-name ${APP_ID}-OAuth2-Clients-${STAGE} \
--attribute-definitions AttributeName=id,AttributeType=S \
--key-schema AttributeName=id,KeyType=HASH \
--billing-mode PAY_PER_REQUEST

# RefreshTokens
./local-dynamodb.sh create-table \
--table-name ${APP_ID}-OAuth2-RefreshTokens-${STAGE} \
--attribute-definitions AttributeName=id,AttributeType=S \
--key-schema AttributeName=id,KeyType=HASH \
--billing-mode PAY_PER_REQUEST
