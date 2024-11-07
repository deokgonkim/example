const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const WHATSAPP_WEBHOOKS_TABLE =
  process.env.WHATSAPP_WEBHOOKS_TABLE || 'whatsapp-webhooks-table-dev';
const WHATSAPP_USERS_TABLE =
  process.env.WHATSAPP_USERS_TABLE || 'whatsapp-users-table-dev';

const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

/**
 * Record received whatsapp message
 * @param {WhatsAppMessage} message
 */
module.exports.recordWhatsapp = async (message) => {
  const params = {
    TableName: WHATSAPP_WEBHOOKS_TABLE,
    Item: {
      MessageSid: message?.MessageSid,
      From: message?.From,
      To: message?.To,
      Body: message?.Body,
      message: message,
    },
  };

  try {
    await dynamoDbClient.send(new PutCommand(params));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.findWhatsAppMessageOriginatingFrom = async (fromUser) => {
  const params = {
    TableName: WHATSAPP_WEBHOOKS_TABLE,
    FilterExpression: '#from = :fromUser',
    ExpressionAttributeNames: {
      '#from': 'From',
    },
    ExpressionAttributeValues: {
      ':fromUser': fromUser,
    },
  };

  try {
    const { Items, Count } = await dynamoDbClient.send(new ScanCommand(params));
    return {
      Items,
      Count,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 *
 * @param {string} whatsappUserId
 * @returns
 */
module.exports.getWhatsAppUserById = async (whatsappUserId) => {
  const params = {
    TableName: WHATSAPP_USERS_TABLE,
    Key: {
      whatsappUserId: whatsappUserId,
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

/**
 *
 * @param {WhatsAppUser} user
 * @param {string} userId
 * @param {string} orderId
 */
module.exports.recordWhatsAppUser = async (user, userId, orderId) => {
  try {
    const existingUser = await module.exports.getWhatsAppUserById(
      user?.whatsappUserId
    );
    if (existingUser) {
      // update dynamodb record with userId and orderId
      const params = {
        TableName: WHATSAPP_USERS_TABLE,
        Key: {
          whatsappUserId: existingUser.whatsappUserId,
        },
        UpdateExpression:
          'SET userIds = list_append(userIds, :userId), orderIds = list_append(orderIds, :orderId)',
        ExpressionAttributeValues: {
          ':userId': [userId],
          ':orderId': [orderId],
        },
      };
      await dynamoDbClient.send(new UpdateCommand(params));
    } else {
      const params = {
        TableName: WHATSAPP_USERS_TABLE,
        Item: {
          whatsappUserId: user?.whatsappUserId,
          ProfileName: user?.ProfileName,
          userIds: userId ? [userId] : [],
          orderIds: orderId ? [orderId] : [],
        },
      };
      await dynamoDbClient.send(new PutCommand(params));
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.getWhatsAppUsersUsingUserId = async (userId) => {
  const params = {
    TableName: WHATSAPP_USERS_TABLE,
    FilterExpression: 'contains(userIds, :userId)',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  try {
    const { Items, Count } = await dynamoDbClient.send(new ScanCommand(params));
    return {
      Items,
      Count,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 *
 * @param {string} orderId
 * @returns
 */
module.exports.getWhatsAppUsersUsingOrderId = async (orderId) => {
  const params = {
    TableName: WHATSAPP_USERS_TABLE,
    FilterExpression: 'contains(orderIds, :orderId)',
    ExpressionAttributeValues: {
      ':orderId': orderId,
    },
  };

  try {
    const { Count, Items } = await dynamoDbClient.send(new ScanCommand(params));
    return {
      Count,
      Items,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
