from dotenv import load_dotenv
load_dotenv('./.env')

import json
import os
import websocket


ws_url = os.getenv('WS_URL', None)
if ws_url is None:
    raise Exception('WS_URL is not set in .env file')

def on_message(ws, message):
    print(message)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    print("### open ###")
    ws.send(json.dumps({
        'type': 'chat',
        'data': json.dumps({
            'name': 'John Doe'
        })
    }))

ws = websocket.WebSocketApp(ws_url,
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close)
ws.on_open = on_open

ws.run_forever()
