import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), '.env'))

from telethon import utils
from telethon.sync import TelegramClient

# Replace these with your own values
api_id = os.getenv('TELEGRAM_API_ID')
api_hash = os.getenv('TELEGRAM_API_HASH')
phone_number = os.getenv('TELEGRAM_PHONE_NUMBER')

# Initialize the client
client = TelegramClient('session_name', api_id, api_hash)

async def main():
    # Connect to the client
    # print(f'phone_number: {phone_number}')
    await client.start(phone_number)

    # Fetch all chat rooms (dialogs)
    to = await client.get_entity('t.me/tastyguys_unofficial')

    result = await client.send_message(to, 'Hello! Hi! How are you?')
    print(result)

# Run the client
with client:
    client.loop.run_until_complete(main())
