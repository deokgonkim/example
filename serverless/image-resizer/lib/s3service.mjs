import AWS from 'aws-sdk';

// AWS S3 객체 생성
const S3 = new AWS.S3({
    "region": "ap-northeast-2"
});

const DEFAULT_S3_BUCKET = process.env.AWS_BUCKET_NAME;

// eslint-disable-next-line no-unused-vars
const S3_UPLOAD_SAMPLE_RESPONSE = {
    "ETag": "\"40671f57a112fb1ffcb38645cc4c8cda\"",
    "Location": "https://s3.ap-northeast-2.amazonaws.com/image.dgkim.net/sample.jpeg",
    "key": "sample.jpg",
    "Key": "sample.jpg",
    "Bucket": "image.dgkim.net"
}

/**
 * S3 URL에서 bucket명과 path Key를 반환한다.
 * @param {*} s3Url 
 * @returns 
 */
const extractBucketAndKey = (s3Url) => {
    const matching = s3Url.match(/s3:\/\/([a-zA-Z0-9-_\.]*)\/(.*)/);
    if (matching == null) {
        throw new Error(`Failed to parse S3 url ${s3Url}`);
    }
    const [ fullUrl, bucket, key ] = matching;
    return {
        bucket, key, fullUrl
    }
}

/**
 * S3 파일 객체를 반환한다.
 * @param {String} s3Url S3 URL
 * @returns
 */
const s3GetObjectUsingS3Url = async (s3Url) => {
    if (!s3Url.startsWith('s3://')) {
        throw new Error(`Invalid S3 url ${s3Url}`);
    }
    const matching = s3Url.match(/s3:\/\/([a-zA-Z0-9-_\.]*)\/(.*)/);
    if (matching == null) {
        throw new Error(`Failed to parse S3 url ${s3Url}`);
    }
    const [ fullUrl, bucket, key ] = matching;
    const file = await S3.getObject({
        Bucket: bucket,
        Key: key
    }).promise();
    return file;
}

const s3GetObject = async (bucket, key) => {
    const file = await S3.getObject({
        Bucket: bucket,
        Key: key
    }).promise();
    return file;
}

const s3GetObjectThumbnail = async (s3Url, size) => {
    if (!s3Url.startsWith('s3://')) {
        throw new Error(`Invalid S3 url ${s3Url}`);
    }
    const matching = s3Url.match(/s3:\/\/([a-zA-Z0-9-_\.]*)\/(.*)/);
    if (matching == null) {
        throw new Error(`Failed to parse S3 url ${s3Url}`);
    }
    let [ fullUrl, bucket, key ] = matching;
    key = `thumbnail/${size}/${key}`;
    return s3GetObject(`s3://${bucket}/${key}`);
}

/**
 * S3에 파일을 업로드한다.
 * @param {Buffer} content 파일 내용
 * @param {String} s3Bucket S3 버킷 이름
 * @param {String} s3Path S3 경로명 (맨 앞 '/' 없이)
 * @param {String|undefined} contentType 파일 형식
 * @returns 
 */
const uploadFileToS3 = async (content, s3Bucket, s3Path, contentType) => {
    // s3_path에 '/'가 붙은 경우 제거한다.
    if (s3Path.startsWith('/')) s3Path = s3Path.substring(1);
    const bucket_name = s3Bucket ? s3Bucket : DEFAULT_S3_BUCKET;
    console.log(`Uploading file (${content.length} bytes) to s3://${bucket_name}/${s3Path}`);
    return S3.upload({
        "Bucket": bucket_name,
        "Key": s3Path,
        "Body": content,
        "ContentType": contentType
    }).promise();
}

/**
 * S3 버킷에서 파일을 .Trash 경로로 이동한다.
 * @param {String} s3Url 
 */
const moveToTrash = async (s3Url) => {
    if (!s3Url.startsWith('s3://')) {
        throw new Error(`Invalid S3 url ${s3Url}`);
    }
    const matching = s3Url.match(/s3:\/\/([a-zA-Z0-9-_\.]*)\/(.*)/);
    if (matching == null) {
        throw new Error(`Failed to parse S3 url ${s3Url}`);
    }
    const [ fullUrl, bucket, key ] = matching;
    const file = await S3.getObject({
        Bucket: bucket,
        Key: key
    }).promise();
    if (file == null) {
        throw new Error(`Failed to getObject ${s3Url}`);
    }
    const newKey = '.Trash/' + key;
    const copyResult = await S3.copyObject({
        Bucket: bucket,
        CopySource: encodeURI(`/${bucket}/${key}`),
        Key: newKey
    }).promise();
    console.log('copyObject', JSON.stringify(copyResult, null, 4));
    const deleteResult = await S3.deleteObject({
        Bucket: bucket,
        Key: key
    }).promise();
    console.log('deleteObject', JSON.stringify(deleteResult, null, 4));
    return deleteResult;
}

export default {
    extractBucketAndKey,
    s3GetObjectUsingS3Url,
    s3GetObject,
    s3GetObjectThumbnail,
    uploadFileToS3,
    moveToTrash
};
