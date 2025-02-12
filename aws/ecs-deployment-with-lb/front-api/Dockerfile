FROM node:12

WORKDIR /app

# Install required OS packages
# - jq to support aws cli
RUN apt update && apt install -y jq

# Install AWS CLI for secrets manager
RUN cd /tmp && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -Rf /tmp/aws

# Install required dependencies
COPY package*.json /app
RUN npm ci

# both environment should be provided in ECS Task Definition
# ENV APP_PREFIX=front-api
# ENV STAGE=local

# Copy application
COPY . /app

ENTRYPOINT ["/app/entrypoint.sh"]
