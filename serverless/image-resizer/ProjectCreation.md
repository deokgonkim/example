# Project creation

## Create project directory

```bash
mkdir image-resizer
cd image-resizer
```

## Initialize `git` project

```bash
git init .
```

## Prepare `.gitignore`

- https://www.toptal.com/developers/gitignore/api/node,serverless

## Prepare `node` project

```bash
npm init
```

## Prepare `serverless` project

```bash
npm install --save-dev serverless
npx sls
# 1. choose `AWS - Node.js - SQS Worker`
# 2. enter image-resizer
# 3. do not register to `Serverless Dashboard`
```
** NOT USING `sls` GENERATED PROJECT **
** INSTEAD COPY `handler.js` AND `serverless.yml`
