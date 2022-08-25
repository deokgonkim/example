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

## Reference

- https://www.createwithswift.com/tutorial-getting-started-with-swift-aws-lambda-runtime/

- https://www.serverless.com/blog/framework-example-golang-lambda-support/

- https://www.serverless.com/framework/docs/providers/aws/guide/packaging
