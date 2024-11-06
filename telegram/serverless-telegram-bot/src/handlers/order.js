const telegramDb = require('../telegram/db');
const telegramApi = require('../telegram/bot');

/**
 * Dynamo DB on change event handler
 * @param {*} event
 * @param {*} context
 */
// eslint-disable-next-line no-unused-vars
const onOrderChange = async (event, context) => {
  console.log('Order changed', event);

  for (const record of event.Records) {
    /**
     * @type {DynamoDBStreamRecord}
     */
    const streamEvent = record;
    const eventName = streamEvent.eventName;
    if (eventName !== 'MODIFY') {
      console.log('Skipping record', eventName);
      continue;
    }
    console.log('Processing record', JSON.stringify(record, null, 4));
    const newOrderId = streamEvent.dynamodb.NewImage.orderId.S;
    console.log('Processing order', newOrderId);
    const { Count: foundUserCount, Items: foundUsers } =
      await telegramDb.getTelegramUsersUsingOrderId(newOrderId);
    console.log('Existing telegram user', foundUserCount);
    for (const user of foundUsers) {
      const telegramUserId = user.telegramUserId;
      const message = `Order ${newOrderId} has been changed!`;
      console.log('Sending message', message);
      await telegramApi.sendMessage(telegramUserId, message);
    }
  }
  return event;
};

module.exports = {
  onOrderChange,
};
