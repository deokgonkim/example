# python-flask

This example is using `serverless` framework, `flask` framework, `serverless-wsgi` plugin.

## Prepare local development environment

- Install nodejs dependencies
  ```bash
  npm ci
  ```

- Install python dependencies
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  ```

## Run development server

```bash
npm run serve
# or
npx sls wsgi serve -p 8000
```

## Deploy

**BEFORE RUNNING DEPLOY YOU MUST CREATE `.env` FILE FIRST**

```bash
npm run deploy-dev
# or
npx sls deploy
```
