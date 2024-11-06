const express = require('express');

const db = require('./db');
const { sendMessage } = require('./bot');

const router = express.Router();

router.get('/', async (req, res) => {
  res.json({ message: 'Hello from Telegram!' });
});

router.get('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  const telegramUser = await db.getTelegramUserById(userId)
  if (telegramUser) {
    res.json(telegramUser);
  } else {
    res.status(404).json({ error: `Could not find user with provided ${userId}` });
  }
});

router.get('/order-user/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  const {Count: foundCount, Items: telegramUsers} = await db.getTelegramUsersUsingOrderId(orderId)
  if (telegramUsers) {
    res.json(telegramUsers);
  } else {
    res.status(404).json({ error: `Could not find user with provided ${orderId}` });
  }
});

router.post('/', async (req, res) => {
  console.log('received request', JSON.stringify(req.body, null, 4));

  /**
   * @type {TelegramUpdate}
   */
  const telegramUpdate = req.body;
  await db.recordTelegramWebHook(telegramUpdate);

  // const telegramUserId = telegramUpdate?.message?.from?.id;
  const entities = telegramUpdate?.message?.entities;
  if (entities) {
    for (const entity of entities) {
      if (entity.type === 'bot_command') {
        const command = telegramUpdate.message.text.slice(entity.offset, entity.offset + entity.length);
        console.log('Command:', command);
        if (command == '/start') {
          // retrieve userId and orderId from the command
          // the value is base64 encoded
          const decodedValue = Buffer.from(telegramUpdate.message.text.slice(entity.offset + entity.length + 1), 'base64').toString();
          const value = decodedValue?.split(',');
          const userId = value?.[0];
          const orderId = value?.[1];
          console.log('userId:', userId);
          console.log('orderId:', orderId);
          if (userId && orderId) {
            await db.recordTelegramUser(telegramUpdate.message.from, userId, orderId);
          }
        }
      }
    }
  }

  await sendMessage(telegramUpdate.message.chat.id, 'When something happens, I will notify you!');

  // console.log(message);
  res.json({ message: 'Message received!' });
});

module.exports = router;
