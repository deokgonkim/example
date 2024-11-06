const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const TELEGRAM_WEBHOOKS_TABLE =
  process.env.TELEGRAM_WEBHOOKS_TABLE || 'telegram-webhooks-table-dev';
const TELEGRAM_USERS_TABLE =
  process.env.TELEGRAM_USERS_TABLE || 'telegram-users-table-dev';

const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

/**
 * Record received Telegram webhook udpate
 * @param {TelegramUpdate} update
 */
module.exports.recordTelegramWebHook = async (update) => {
  const params = {
    TableName: TELEGRAM_WEBHOOKS_TABLE,
    Item: {
      updateId: update?.update_id,
      fromId: update?.message?.from?.id,
      fromUsername: update?.message?.from?.username,
      message: update?.message,
    },
  };

  try {
    await dynamoDbClient.send(new PutCommand(params));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 *
 * @param {Number} userId
 * @returns
 */
module.exports.getTelegramUserById = async (userId) => {
  const params = {
    TableName: TELEGRAM_USERS_TABLE,
    Key: {
      telegramUserId: Number(userId),
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
 * @param {TelegramUser} user
 * @param {string} userId
 * @param {string} orderId
 */
module.exports.recordTelegramUser = async (user, userId, orderId) => {
  try {
    const existingUser = await module.exports.getTelegramUserUsingUserId(
      user?.id
    );
    if (existingUser) {
      // update dynamodb record with userId and orderId
      const params = {
        TableName: TELEGRAM_WEBHOOKS_TABLE,
        Key: {
          updateId: existingUser.updateId,
        },
        UpdateExpression:
          'SET userId = list_append(userId, :userId), orderId = list_append(orderId, :orderId)',
        ExpressionAttributeValues: {
          ':userId': [userId],
          ':orderId': [orderId],
        },
      };
      await dynamoDbClient.send(new UpdateCommand(params));
    } else {
      const params = {
        TableName: TELEGRAM_USERS_TABLE,
        Item: {
          telegramUserId: user?.id,
          isBot: user?.is_bot,
          firstName: user?.first_name,
          lastName: user?.last_name,
          username: user?.username,
          languageCode: user?.language_code,
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

module.exports.getTelegramUsersUsingUserId = async (userId) => {
  const params = {
    TableName: TELEGRAM_USERS_TABLE,
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
module.exports.getTelegramUsersUsingOrderId = async (orderId) => {
  const params = {
    TableName: TELEGRAM_USERS_TABLE,
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
