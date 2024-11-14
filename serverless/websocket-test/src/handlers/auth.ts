import { APIGatewayRequestAuthorizerEvent, AuthResponse } from 'aws-lambda';

/**
 * DEPRECATED Implement authorization in application logic.
 * @deprecated Browser `WebSocket` client doesn't support HTTP Header.
 * @param event
 * @returns
 */
export const handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<AuthResponse> => {
    console.log('event', JSON.stringify(event, null, 4));

    const token = event.headers?.Authorization || event.headers?.authorization;
    const paramToken = event.queryStringParameters?.token;

    if (!token && !paramToken) {
        console.log('No token provided');
        const response = generatePolicyDocument(event.requestContext.connectionId!, 'Deny', event.methodArn);
        console.error(JSON.stringify(response, null, 4));
        return response;
    }

    // Here you would typically verify the token with your authentication provider
    // For example, using AWS Cognito, Auth0, Firebase, etc.
    // const isValid = await verifyToken(token);
    const isValid = token === 'valid-token' || paramToken === 'valid-token'; // Placeholder for token validation logic

    if (!isValid) {
        const response = generatePolicyDocument(event.requestContext.connectionId!, 'Deny', event.methodArn);
        console.error(JSON.stringify(response, null, 4));
        return response;
    }

    const response = generatePolicyDocument(event.requestContext.connectionId!, 'Allow', event.methodArn);
    console.log(JSON.stringify(response, null, 4));
    return response;

};

export const generatePolicyDocument = (principalId: string, effect: string, resource: string): AuthResponse => {
    return {
        "principalId": principalId, // Can be any identifier
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": effect == 'Allow' ? 'Allow' : 'Deny',
                    "Resource": resource
                }
            ]
        }
    };
}
