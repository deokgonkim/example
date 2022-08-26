# swift

This example demonstrates AWS `Lambda` writen in `Swift` Language, and deploy with `serverless` framework

## Prepare Build Machine

- create docker image that will be used as `swift` build and packaging
    ```bash
    ./prep-docker.sh
    ```

## Compile and build swift binary

```bash
./lambda-build.sh
```

## Prepare Lambda deployment artifact

- will generate `lambda.zip`
```bash
./lambda-package.sh
```

## Deploy lambda with serverless framework

```bash
npx sls deploy
```

## Reference

- https://www.createwithswift.com/tutorial-getting-started-with-swift-aws-lambda-runtime/
- https://www.serverless.com/blog/framework-example-golang-lambda-support/
- https://www.serverless.com/framework/docs/providers/aws/guide/packaging
- https://stackoverflow.com/questions/56512769/unable-to-find-docker-image-locally
- https://www.docker.com/blog/multi-platform-docker-builds/
- https://www.raywenderlich.com/18302911-aws-lambda-tutorial-for-swift-getting-started
