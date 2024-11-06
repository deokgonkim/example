
/**
 * @typedef {Object} DynamoDBStreamEvent
 * @property {string} eventID - The unique identifier for the event.
 * @property {string} eventName - The type of event (e.g., "MODIFY").
 * @property {string} eventVersion - The version of the event.
 * @property {string} eventSource - The source of the event (e.g., "aws:dynamodb").
 * @property {string} awsRegion - The AWS region where the event originated.
 * @property {Object} dynamodb - The DynamoDB stream record.
 * @property {number} dynamodb.ApproximateCreationDateTime - The approximate creation time of the event in Unix epoch time.
 * @property {Object} dynamodb.Keys - The primary key attributes that define the item.
 * @property {Object} dynamodb.Keys.orderId - The primary key attribute.
 * @property {string} dynamodb.Keys.orderId.S - The string value of the primary key attribute.
 * @property {Object} dynamodb.NewImage - The new image of the item after the event.
 * @property {Object} dynamodb.NewImage.orderId - The primary key attribute in the new image.
 * @property {string} dynamodb.NewImage.orderId.S - The string value of the primary key attribute in the new image.
 * @property {Object} dynamodb.NewImage.status - The status attribute in the new image.
 * @property {string} dynamodb.NewImage.status.S - The string value of the status attribute in the new image.
 * @property {Object} dynamodb.OldImage - The old image of the item before the event.
 * @property {Object} dynamodb.OldImage.orderId - The primary key attribute in the old image.
 * @property {string} dynamodb.OldImage.orderId.S - The string value of the primary key attribute in the old image.
 * @property {string} dynamodb.SequenceNumber - The sequence number of the stream record.
 * @property {number} dynamodb.SizeBytes - The size of the stream record in bytes.
 * @property {string} dynamodb.StreamViewType - The type of data from the stream (e.g., "NEW_AND_OLD_IMAGES").
 * @property {string} eventSourceARN - The ARN of the event source.
 */
