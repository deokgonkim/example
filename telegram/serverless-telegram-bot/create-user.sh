#!/bin/bash

source ./env.sh

# create user
curl -X POST -H "Content-Type: application/json" -d '{
  "userId": "2001",
  "name": "user1",
  "password": "password1"
}' $API_BASE_URL/users
