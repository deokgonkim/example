import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

describe('test websocket', () => {
    it('test sending message', async () => {
        const connectionId = 'BOkf2dd4oE0CJBQ=';

        const websocketUrl = process.env.WEBSOCKET_ENDPOINT?.replace('wss:', 'https:');

        const messageData = JSON.stringify({ type: "request", action: "foo", message: "Hello from test!" });

        const apiGatewayClient = new ApiGatewayManagementApiClient({
            endpoint: websocketUrl, // e.g., "your-api-id.execute-api.region.amazonaws.com/production"
        });

        const command = new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: messageData,
        });

        await apiGatewayClient.send(command);
    }, 30000);
});
