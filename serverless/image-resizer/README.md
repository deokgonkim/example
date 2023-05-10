# image-resizer

이미지 리사이징 람다

- Request
    - URL : https://sqs.ap-northeast-2.amazonaws.com/[AWS:AccountID]/ImageResizeQueue-[STAGE]
    - Payload : body를 아래 payload를 stringify해서 보낸다.
        ```javascript
        {
            "s3url": "s3://image.dgkim.net/sample.jpg",
            "size": 375
        }
        ```

## Reference

- https://sharp.pixelplumbing.com/api-resize
- https://obviy.us/blog/sharp-heic-on-aws-lambda/
- ~~https://github.com/zoellner/sharp-heic-lambda-layer~~
    - ~~BUILDING LAYER IS **VERY** COMPLICATED~~
    - ~~SEVERAL `yum install` ON `Amazon Linux2` (build requires `yum install`)~~
- ~~https://www.serverless.com/framework/docs/providers/aws/guide/layers~~
- https://intrepidgeeks.com/tutorial/cloudfront--lambdaedge-image-management-3-lambdaedge-set-up
- https://github.com/libvips/libvips/discussions/2340

## OLD

- `heic-convert` 사용하는 것으로 해결함.
    - ~~sharp HEIC 처리를 위해서, lambda layer를 사용했는데, 손이 너무 가고 버전관리가 불리한 면이 있는 것 같다. heic-converter를 사용하는 편이 유리할 수 있겠다.~~
    - ~~https://obviy.us/blog/sharp-heic-on-aws-lambda/ 여기서 제공하는 방법으로 layer를 사용했으나, 아직 HEIC 되지 않는다.~~ : 
    - ~~EC2 test-build-sharp-lambda-layer 에서 lambda layer build 수행하였음.~~
