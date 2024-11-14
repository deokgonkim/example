"""
This program is to test WebSocket communication between client and server.
Made with Tkinter.
"""
from dotenv import load_dotenv
load_dotenv('./.env')

import tkinter as tk
import threading
import asyncio
import websockets
import json
import os


class App(tk.Tk):

    def __init__(self):
        super().__init__()

        self.title('WebSocket Client')
        self.geometry('400x600')

        self.ws_url = os.getenv('WS_URL', None)
        if self.ws_url is None:
            raise Exception('WS_URL is not set in .env file')

        self.ws = None

        self.create_widgets()

    def create_widgets(self):
        self.label = tk.Label(self, text='WebSocket Client')
        self.label.pack()

        self.client_message = tk.Text(self, height=5, width=50)
        self.client_message.pack(pady=10)

        self.message_display = tk.Text(self, height=15, width=50)
        self.message_display.pack(pady=10)

        # self.send_button = tk.Button(self, text='Send', command=self.send)
        # self.send_button.pack()

        self.connect_button = tk.Button(self, text='Connect', command=self.connect_to_websocket)
        self.connect_button.pack()

        # self.disconnect_button = tk.Button(self, text='Disconnect', command=self.disconnect)
        # self.disconnect_button.pack()
        
    def connect_to_websocket(self):
        # Run the WebSocket connection in a separate thread
        threading.Thread(target=self.start_websocket, daemon=True).start()

    def start_websocket(self):
        asyncio.run(self.websocket_handler(self.ws_url))

    async def websocket_handler(self, ws_url):
        try:
            headers = {
                # 'Authorization': f'valid-token'
            }
            async with websockets.connect(ws_url, additional_headers=headers) as websocket:
                while True:
                    data = self.client_message.get(1.0, tk.END).strip()
                    if data:
                        print('sending', data)
                        await websocket.send(data)
                        self.client_message.delete(1.0, tk.END)
                    message = await websocket.recv()
                    print('received', message)
                    self.update_message_display(message)
        except Exception as e:
            self.update_message_display(f"Error: {e}")

    def update_message_display(self, message):
        self.message_display.insert(tk.END, message + "\n")
        self.message_display.see(tk.END)

    # def connect(self):
    #     self.ws = websockets.connect(self.ws_url)
    #     self.ws = asyncio.get_event_loop().run_until_complete(self.ws)

    #     self.thread = threading.Thread(target=self.listen)
    #     self.thread.start()

    # def disconnect(self):
    #     self.ws.close()
    #     self.ws = None

    def send(self):
        data = self.entry.get()
        # self.ws.send(json.dumps({
        #     'action': 'myfirstaction',
        #     'data': {
        #         'name': data
        #     }
        # }))
        

    # def listen(self):
    #     loop = asyncio.new_event_loop()
    #     asyncio.set_event_loop(loop)
    #     while True:
    #         message = asyncio.get_event_loop().run_until_complete(self.ws.recv())
    #         print(message)



if __name__ == '__main__':
    app = App()
    app.mainloop()