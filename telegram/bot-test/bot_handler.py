from dotenv import load_dotenv
load_dotenv('./.env')

import os
from telegram import Update
# from telegram.ext import Updater, CommandHandler, CallbackContext
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
import sqlite3



BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
print('BOT_TOKEN:', BOT_TOKEN)


# def start(update: Update, context: CallbackContext) -> None:
#     message = context.args[0] if context.args else "Welcome!"
#     update.message.reply_text(f"You said: {message}")

# def main():
#     updater = Updater("YOUR_API_TOKEN")
#     updater.dispatcher.add_handler(CommandHandler("start", start))
#     updater.start_polling()
#     updater.idle()

# if __name__ == '__main__':
#     main()


class SqliteBackend():
    """
    A simple SQLite backend to store chat IDs
    """


    def __init__(self):
        self.conn = sqlite3.connect('chat_ids.db')
        self.cursor = self.conn.cursor()
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_ids (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id TEXT NOT NULL,
                arg TEXT
            )
        ''')
        self.conn.commit()

    def save_chat_id(self, chat_id, arg):
        self.cursor.execute('''
            INSERT INTO chat_ids (chat_id, arg) VALUES (?, ?)
        ''', (chat_id, arg))
        self.conn.commit()


db = SqliteBackend()


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Send a welcome message when the /start command is issued
    print("Received /start command")
    print(update)
    received_text = update.message.text
    command = received_text.split()[0]
    arg = received_text.split()[1] if len(received_text.split()) > 1 else None
    print("Command:", command)
    print('Arg:', arg)
    db.save_chat_id(update.message.chat_id, arg)
    await update.message.reply_text("Welcome to the bot! How can I assist you today?")


async def blaHandler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    print("Received /bla command")
    print(update)
    received_text = update.message.text
    command = received_text.split()[0]
    arg = received_text.split()[1] if len(received_text.split()) > 1 else None
    print("Command:", command)
    print('Arg:', arg)
    db.save_chat_id(update.message.chat_id, arg)
    await update.message.reply_text("Bla bla bla")


def main():
    # Create the Application and pass it your bot's token
    application = ApplicationBuilder().token(BOT_TOKEN).build()

    # Register the /start command handler
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("bla", blaHandler))

    # Start the bot
    application.run_polling()

if __name__ == '__main__':
    # import asyncio
    # asyncio.run(main())
    main()
