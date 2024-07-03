"""
To retreive the list of chats that the bot is currently in.
"""
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), '.env'))

from functools import reduce

from telethon.sync import TelegramClient
from telethon.tl.functions.messages import GetDialogsRequest
from telethon.tl.functions.channels import GetParticipantsRequest
from telethon.tl.types import ChannelParticipantsSearch
from telethon.tl.types import InputPeerEmpty

# Replace these with your own values
api_id = os.getenv('TELEGRAM_API_ID')
api_hash = os.getenv('TELEGRAM_API_HASH')
phone_number = os.getenv('TELEGRAM_PHONE_NUMBER')

# Initialize the client
client = TelegramClient('session_name', api_id, api_hash)

async def getChatRoomMembers(chat_id):
    # Get the chat room entity
    chat_room_entity = await client.get_entity(chat_id)

    # Fetch all members of the chat room
    offset = 0
    limit = 100  # Adjust the limit as needed
    all_participants = []

    while True:
        participants = await client(GetParticipantsRequest(
            chat_room_entity, ChannelParticipantsSearch(''), offset, limit, hash=0
        ))
        if not participants.users:
            break
        all_participants.extend(participants.users)
        offset += len(participants.users)

    # Print details of each member
    for user in all_participants:
        print(f"User ID: {user.id}, Username: {user.username}, First Name: {user.first_name}, Last Name: {user.last_name}")

async def main():
    # Connect to the client
    print(f'phone_number: {phone_number}')
    await client.start(phone_number)

    # Fetch all chat rooms (dialogs)
    all_chats = list()
    offset_id = 0
    offset_date = None
    while True:
        result = await client(GetDialogsRequest(
            offset_date=offset_date,
            offset_id=offset_id,
            offset_peer=InputPeerEmpty(),
            limit=100,
            hash=0
        ))
        if not result.chats:
            break
        all_chats.extend(result.chats)
        offset_id = result.chats[-1].id
        
        offset_date = (reduce(lambda a, b: a if hasattr(a, 'date') else (b if hasattr(b, 'date') else None), result.chats[::-1])).date
        # if hasattr(result.chats[-1], 'date'):
        #     offset_date = result.chats[-1].date

    # Print the title of each chat room
    for chat in all_chats:
        print(f"Chat ID: {chat.id}, Title: {chat.title if hasattr(chat, 'title') else 'Private Chat'}")
        try: 
            await getChatRoomMembers(chat.id)
        except Exception as e:
            print(f"Error: {e}")

# Run the client
with client:
    client.loop.run_until_complete(main())
