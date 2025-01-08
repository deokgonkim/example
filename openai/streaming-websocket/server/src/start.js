// websocket server
const WebSocket = require('ws');
const { complete } = require('./openai');

const port = 3001;

const wss = new WebSocket.Server({ port });

wss.on('connection', (ws) => {
    console.log('A new client connected');
    
    ws.on('message', (message) => {
        console.log('Received:', message);
        complete(message.toString()).then(async (stream) => {
            for await (const chunk of stream) {
                const message = chunk?.choices?.[0]?.delta?.content;
                // console.log('chunk:', chunk);
                console.log('message:', message);
                
                if (message)
                    ws.send(message);
            }
        });
    });
});
