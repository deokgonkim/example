# Secrets Manager

AWS Secrets Manager provides safer way to store sensitive information like passwords

- Create Secrets Manager
    - [aws-cli/create.sh](aws-cli/create.sh) : using AWS CLI
    - [cloudformation/cloudformation.sh](cloudformation/cloudformation.sh) : using AWS Cloudformation (requires AWS CLI)
- Write informations into Secrets Manager
    - [aws-cli/insert-secrets.sh](insert-secrets.sh) : using AWS CLI and `.env` file
- Read Secrets Manager
    - [aws-cli/read-secrets.sh](read-secrets.sh) : using AWS CLI (Values will be available as Environment Variables)
