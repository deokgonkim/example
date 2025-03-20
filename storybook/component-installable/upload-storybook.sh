#!/bin/bash

# upload to S3 bucket
# https://medium.com/@punkyoon/serving-index-html-in-sub-directory-via-amazon-s3-cloudfront-55ca7eb5362a
# aws s3 sync ./storybook-static/ s3://doc.dgkim.net/example-component-installable-sb/ --acl public-read
aws s3 sync ./storybook-static/ s3://doc.dgkim.net/example-component-installable-sb/

# invalidate cache on cloudfront
CF_DISTRIBUTION_ID=$(aws cloudfront list-distributions | jq -r '.DistributionList.Items[] | select( .Aliases.Items[] | contains("doc.dgkim.net") ) | .Id')
aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths "/example-component-installable-sb/*"
