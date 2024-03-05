# serverless-docker-sample

This sample project contains `Dockerfile` for AWS Lambda, `serverless.yml` for Serverless deployment.

- `Dockerfile.lambda` : AWS Lambda has package size limitation. so, If the project grows, docker image can be a solution. another solution would be `lambda layer`
- `serverless.yml` : Serverless framework provides easy deployment environment for AWS Lambda

- the original project was consist of `nestjs` and `prisma`
