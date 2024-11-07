const telegramDb = require('../telegram/db');
const telegramApi = require('../telegram/bot');
const whatsappDb = require('../twilio/db');
const whatsappApi = require('../twilio/twilio');

const sendTelegramNotification = async (orderId) => {
  const { Count: foundUserCount, Items: foundUsers } =
    await telegramDb.getTelegramUsersUsingOrderId(orderId);
  console.log('Existing telegram user', foundUserCount);
  for (const user of foundUsers) {
    const telegramUserId = user.telegramUserId;
    const message = `Order ${orderId} has been changed!`;
    console.log('Sending message', message);
    await telegramApi.sendMessage(telegramUserId, message);
  }
};

const sendWhatsappNotification = async (orderId) => {
  const { Count: foundUserCount, Items: foundUsers } =
      await whatsappDb.getWhatsAppUsersUsingOrderId(orderId);
    console.log('Existing whatsapp user', foundUserCount);
    for (const user of foundUsers) {
      const { Items: foundMessages } = await whatsappDb.findWhatsAppMessageOriginatingFrom(user.whatsappUserId);
      console.log('Found messages', foundMessages);
      const from = foundMessages?.at(-1).To;
      const whatsappUserId = user.whatsappUserId;
      const message = `Order ${orderId} has been changed!`;
      console.log('Sending message', message);
      await whatsappApi.sendMessage(from, whatsappUserId, message);
    }
};

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

    await sendTelegramNotification(newOrderId);
    await sendWhatsappNotification(newOrderId);
  }
  return event;
};

module.exports = {
  onOrderChange,
};
