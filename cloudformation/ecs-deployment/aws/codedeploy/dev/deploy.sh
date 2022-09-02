#!/bin/bash

# source env.sh
source ../../cloudformation/dev/env.sh

aws deploy create-deployment \
--application-name ${SERVICE_NAME}-${STAGE} \
--deployment-group-name ${SERVICE_NAME}-${STAGE}-dg \
NOT YET COMPLETED