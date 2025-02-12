#!/bin/bash

export URL=http://localhost:8080/v1/users

curl -X POST $URL \
-H "Content-Type: application/json" \
-d '
{
    "login": "dgkim",
    "password": "password",
    "fullname": "Deokgon Kim"
}
'
