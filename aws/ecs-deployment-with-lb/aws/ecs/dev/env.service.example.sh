export TARGET_GROUP_ARN=arn:aws:elasticloadbalancing:ap-northeast-2:blabla:targetgroup/blabla
export LOAD_BALANCER_NAME=front-api-dev
# Container name is defined in cloudformation.yml / Resources / TaskDefinition / ContainerDefinitions
export CONTAINER_NAME=front-api
export CONTAINER_PORT=3000
# export PRIVATE_SUBNET1=subnet-blabla
# public subnet
export PRIVATE_SUBNET1=subnet-blabla
# export PRIVATE_SUBNET2=subnet-blabla
# public subnet
export PRIVATE_SUBNET2=subnet-blabla
# default (allow none)
# export PRIVATE_SECURITY_GROUP1=sg-blabla
# public-web-services
export PRIVATE_SECURITY_GROUP1=sg-blabla
