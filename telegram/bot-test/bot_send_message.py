from dotenv import load_dotenv
load_dotenv('./.env')

import argparse
import os
from telegram import Bot

token = os.getenv("TELEGRAM_BOT_TOKEN")
print('BOT_TOKEN:', token)

# Initialize the Bot with your token
bot = Bot(token=token)

async def send_message(chat_id, message_text):
    try:
        await bot.send_message(chat_id=chat_id, text=message_text, parse_mode="MarkdownV2")
    except Exception as e:
        print(f"Failed to send message: {e}")
    finally:
        print(f"Message sent to {chat_id}")


# Usage: Replace with the actual chat_id and message
# chat_id = "USER_CHAT_ID"  # Replace with the actual chat_id of the user
# message_text = "Hello from the server! This is a server-initiated message."

default_message = '''
*Bold text*, _italic text_, __underline__, ~strikethrough~
[OpenAI](https://openai.com)
CodeBlock: `print("Hello, world!")`

```
- Unordered list
- Unordered list

1. Ordered list
2. Ordered list
```

[Link](https://www.dgkim.net)

'''


def main():

    parser = argparse.ArgumentParser(description='Send message to a telegram user')
    parser.add_argument('chat_id', type=str, help='Chat ID of the user')
    parser.add_argument('message_text', type=str, nargs='?', default=default_message, help='Message to send (optional)')

    args = parser.parse_args()
    
    if args.chat_id and args.message_text:
        import asyncio
        asyncio.run(send_message(args.chat_id, args.message_text))


if __name__ == '__main__':
    main()

