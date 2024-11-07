const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const ORDERS_TABLE = process.env.ORDERS_TABLE || 'orders-table-dev';

const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);


module.exports.getOrder = async (orderId) => {
  const params = {
    TableName: ORDERS_TABLE,
    Key: {
      orderId,
    },
  };

  try {
    const { Item } = await dynamoDbClient.send(new GetCommand(params));
    return Item;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
