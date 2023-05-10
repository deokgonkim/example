// import { SQS } from 'aws-sdk';
import AWS from 'aws-sdk';

// import resizer from './lib/resizer.mjs';
import resizer from './lib/resizer.cjs';
import s3service from './lib/s3service.mjs';

const sqs = new AWS.SQS();

const DEFAULT_SIZE = 375;

export const producer = async (event) => {
  let statusCode = 200;
  let message;

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No body was found",
      }),
    };
  }

  try {
    await sqs
      .sendMessage({
        QueueUrl: process.env.QUEUE_URL,
        MessageBody: event.body,
        MessageAttributes: {
          AttributeName: {
            StringValue: "Attribute Value",
            DataType: "String",
          },
        },
      })
      .promise();

    message = "Message accepted!";
  } catch (error) {
    console.log(error);
    message = error;
    statusCode = 500;
  }

  return {
    statusCode,
    body: JSON.stringify({
      message,
    }),
  };
};

const SAMPLE_PAYLOAD = {
  "s3url": "s3://image.dgkim.net/sample.jpg",
  "size": 375
}

export const resize = async (event) => {
  for (const record of event.Records) {
    const messageAttributes = record.messageAttributes;
    // console.log(
    //   "Message Attribute: ",
    //   messageAttributes.AttributeName.stringValue
    // );
    console.log("Message Body: ", record.body);
    try {
      const payload = JSON.parse(record.body);
      let { s3url, size } = payload;

      console.log(`s3url: ${s3url}`);
      console.log(`size: ${size}`);
      if (size === undefined) {
        size = 375;
      }

      const { bucket, key } = s3service.extractBucketAndKey(s3url);

      const s3Object = await s3service.s3GetObject(s3url);
      if (s3Object == null) {
        throw new Error(`File ${s3url} not found`);
      }

      let resizedFile;
      const isHeic = key.toUpperCase().endsWith('.HEIC');
      if (isHeic) {
        const jpg = await resizer.heicToJpg(s3Object.Body);
        resizedFile = await resizer.resizeTo(jpg, size);
      } else {
        resizedFile = await resizer.resizeTo(s3Object.Body, size);
      }
      if (resizedFile) {
        let uploadKey;
        if (isHeic) {
          uploadKey = `thumbnail/${size}/${key.slice(0, -5)}.jpg`;
        } else {
          uploadKey = `thumbnail/${size}/${key}`;
        }
        const result = await s3service.uploadFileToS3(resizedFile, bucket, uploadKey);
        console.log(`Uploaded to s3://${bucket}/${uploadKey}`, result);
      } else {
        throw new Error('Failed to generate resizedFile');
      }
    } catch(e) {
      console.error(e);
    }
  }
};
