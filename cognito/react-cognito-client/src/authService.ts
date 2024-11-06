// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    SignUpCommand,
    ConfirmSignUpCommand,
    AuthFlowType,
    OAuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";
//   import config from "./config.json";

export const config: {
    region: string;
    clientId: string;
    hostedUiUrl: string;
} = {
    region: import.meta.env.VITE_AWS_REGION || 'ap-northeast-2',
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || 'your_cognito_client_id',
    hostedUiUrl: import.meta.env.VITE_COGNITO_HOSTED_UI_URL || 'your_cognito_hosted_ui_url',
};

export const cognitoClient = new CognitoIdentityProviderClient({
    region: config.region,
});

/**
 * Authenticate with the `code` received from the OAuth flow
 * @param code
 */
export const oauth2Token = async (code: string) => {
    const url = config.hostedUiUrl + '/oauth2/token';
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        code,
        redirect_uri: document.location.origin + '/return',
    });
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });
    const body = await response.json();
    // console.log("OAuth2 token response: ", body);
    if (body) {
        sessionStorage.setItem("idToken", body.id_token || "");
        sessionStorage.setItem(
            "accessToken",
            body.access_token || "",
        );
        sessionStorage.setItem(
            "refreshToken",
            body.refresh_token || "",
        );
    }
    return body;
}

export const signIn = async (username: string, password: string) => {
    const params = {
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: config.clientId,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        },
    };
    try {
        const command = new InitiateAuthCommand(params);
        const { AuthenticationResult } = await cognitoClient.send(command);
        if (AuthenticationResult) {
            sessionStorage.setItem("idToken", AuthenticationResult.IdToken || "");
            sessionStorage.setItem(
                "accessToken",
                AuthenticationResult.AccessToken || "",
            );
            sessionStorage.setItem(
                "refreshToken",
                AuthenticationResult.RefreshToken || "",
            );
            return AuthenticationResult;
        }
    } catch (error) {
        console.error("Error signing in: ", error);
        throw error;
    }
};

export const signUp = async ({
    username, email, password, phoneNumber
}: {
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
}) => {
    const params = {
        ClientId: config.clientId,
        Username: username,
        Password: password,
        UserAttributes: [
            {
                Name: "email",
                Value: email,
            },
            {
                Name: "phone_number",
                Value: phoneNumber,
            }
        ],
    };
    try {
        const command = new SignUpCommand(params);
        const response = await cognitoClient.send(command);
        console.log("Sign up success: ", response);
        return response;
    } catch (error) {
        console.error("Error signing up: ", error);
        throw error;
    }
};

export const confirmSignUp = async (username: string, code: string) => {
    const params = {
        ClientId: config.clientId,
        Username: username,
        ConfirmationCode: code,
    };
    try {
        const command = new ConfirmSignUpCommand(params);
        await cognitoClient.send(command);
        console.log("User confirmed successfully");
        return true;
    } catch (error) {
        console.error("Error confirming sign up: ", error);
        throw error;
    }
};