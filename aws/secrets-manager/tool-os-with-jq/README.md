# tool

To read `AWS Secrets Manager` with `AWS CLI` and set it with `jq` command.

## read-secrets usage

read-secrets will output dotenv style.
you can read with following bash script
```bash
source <(./read-secrets.sh | sed s/^/"export "/)
```
