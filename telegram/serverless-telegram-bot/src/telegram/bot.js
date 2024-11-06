const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

module.exports.sendMessage = async (chatId, text) => {
  const bot = new TelegramBot(token, {
    polling: false,
  });

  return bot.sendMessage(chatId, text);
}
