#!/bin/bash

IP_BLOCKS=$(curl -o - https://www.gstatic.com/ipranges/goog.json | jq -r '.prefixes[3:] | map(select(.ipv4Prefix)) | map("{CidrIp=" + .ipv4Prefix + "}") | join(",")')

SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --group-name allow-google | jq -r ".SecurityGroups[0].GroupId")

#aws ec2 create-security-group \
#--description "Allow Google to access HTTPS services" \
#--group-name "allow-google"
echo $IP_BLOCKS

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --ip-permissions IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges="[$IP_BLOCKS]"
