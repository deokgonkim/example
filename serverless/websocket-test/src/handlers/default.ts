
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const websocketUrl = process.env.WEBSOCKET_ENDPOINT?.replace('wss:', 'https:');

const apiGatewayClient = new ApiGatewayManagementApiClient({
    endpoint: websocketUrl, // e.g., "your-api-id.execute-api.region.amazonaws.com/production"
});

enum MessageType {
    AUTH_REQUEST = 'auth-request',
    AUTH_RESPONSE = 'auth-response',
    CHAT = 'chat',
    REQUEST = 'request',
    RESPONSE = 'response',
}

interface Message {
    messageId?: string;
    type: MessageType; // type of the message (e.g., chat, system, etc.)
}

interface ChatMessage extends Message {
    type: MessageType.CHAT;
    data: string;
}

interface RequestMessage extends Message {
    action: string;
    data: string;
}

interface ResponseMessage extends Message {
    status: string;
    data?: string;
    error?: {
        code: string;
        message: string;
    };
    requestMessageId?: string;
}

interface AuthRequestMessage extends RequestMessage {
    type: MessageType.AUTH_REQUEST;
    data: string;
}

interface AuthResponseMessage extends ResponseMessage {
    type: MessageType.AUTH_RESPONSE;
    data: string;
}

// const exampleRequestMessage: RequestMessage = {
//     messageId: 'example-request',
//     type: MessageType.REQUEST,
//     action: 'example',
//     data: 'example',
// };

// const exampleResponseMessage: ResponseMessage = {
//     messageId: 'example-response',
//     type: MessageType.RESPONSE,
//     status: 'success',
//     data: 'example',
//     requestMessageId: 'example',
// };

// const exampleAuthRequestMessage: AuthRequestMessage = {
//     messageId: 'example-auth-request',
//     type: MessageType.AUTH_REQUEST,
//     action: 'auth',
//     data: 'example',
// };

// const exampleAuthResponseMessage: AuthResponseMessage = {
//     messageId: 'example-auth-response',
//     type: MessageType.AUTH_RESPONSE,
//     status: 'success',
//     data: 'example',
//     requestMessageId: 'example',
// };

export const handler = async (event) => {
    console.log('event', JSON.stringify(event, null, 4));
    const connectionId = event.requestContext.connectionId;
    const requestId = event.requestContext.requestId;
    let messageData;

    try {
        const receivedBody = JSON.parse(event?.body);
        console.log('receivedBody', receivedBody);
        console.log('command', receivedBody.command);

        let message: Message;
        try {
            message = JSON.parse(event.body) as Message;
        } catch (error) {
            console.error('Invalid message format', error);
            return { statusCode: 400, body: 'Invalid message format' };
        }

        let response: Message;

        switch (message.type) {
            case MessageType.AUTH_REQUEST:
            console.log('Received auth request', message);
            response = <AuthResponseMessage>{
                type: MessageType.AUTH_RESPONSE,
                status: 'success',
                data: 'auth success',
                requestMessageId: message.messageId,
            }
            break;
            case MessageType.CHAT:
            console.log('Received chat message', message);
            response = <ChatMessage>{
                type: MessageType.CHAT,
                data: 'chat received',
            }
            break;
            case MessageType.REQUEST:
            console.log('Received request message', message);
            response = <ResponseMessage>{
                type: MessageType.RESPONSE,
                status: 'success',
                data: 'request received',
                requestMessageId: message.messageId,
            }
            break;
            case MessageType.RESPONSE:
            console.log('Received response message', message);
            response = <ResponseMessage>{
                type: MessageType.RESPONSE,
                status: 'success',
                data: 'response received',
                requestMessageId: message.messageId,
            }
            break;
            default:
            console.error('Unknown message type', message.type);
            response = <ResponseMessage>{
                type: MessageType.RESPONSE,
                status: 'error',
                error: {
                    code: 'unknown-message-type',
                    message: 'Unknown message type',
                },
                requestMessageId: message.messageId,
            }
        }

        // to send a message to client, we should use api gateway method `postToConnection`
        const command = new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify(response, null, 4),
        });

        await apiGatewayClient.send(command);
    } catch (err) {
        console.error('Error WSURL:', websocketUrl);
        console.error("Error posting to connection:", err);
        // Optionally handle stale connections by removing them from your database
        const command = new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify({
                messageId: `request-${requestId}`,
                type: 'error',
                status: 'error',
                error: {
                    code: 'unknown-error',
                    message: err.message,
                }
            }),
        });
        await apiGatewayClient.send(command);
    }

    // returning message is not sent to the client
    return { statusCode: 200, body: "Message sent." };
    // return {
    //     statusCode: 200,
    //     body: JSON.stringify({
    //         message: 'defaultHandler',
    //         event,
    //     }),
    // };
};
