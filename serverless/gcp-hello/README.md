# gcp serverless functions hello world

- references
  - https://www.serverless.com/examples/google-node-simple-http-endpoint/
  - https://www.serverless.com/framework/docs/providers/google/guide/credentials

## Enable APIs

- Reference : https://www.serverless.com/framework/docs/providers/google/guide/credentials

- `Cloud Functions API`
- `Cloud Deployment Manager V2 API`
- `Cloud Build API`
- `Cloud Storage` (already enabled on dgkim's account)
- `Cloud Logging API` (already enabled on dgkim's account)

## Deploy project

```bash
npm run deploy-dev
```

## ERROR???

deployment was successful but, endpoint url is not working

- deployed url : https://us-central1-[project-id].cloudfunctions.net/gcp-hello-dev-helloWorld

- response
```
Error: Forbidden
Your client does not have permission to get URL /gcp-hello-dev-helloWorld from this server.
```

## **update**

- reference : https://stackoverflow.com/questions/67095704/deploy-allow-unauthenticated-gcp-functions-with-serverless
