# dialog bot

1. Start server
  ```bash
  npm run start
  ```

2. Trigger
  in slack, use search bar or `/` command to trigger `Show me Dialog`(or some thing you defined)

3. Server will receive the payload. and can send message to slack channel

## Create bot token

```
To obtain a bot token for your Slack app, follow these steps:

1. Go to the Slack API website: [https://api.slack.com/apps](https://api.slack.com/apps).
2. Click on "Create New App" or select an existing app if you have one.
3. Choose "From scratch" or "From an app manifest" to create your app.
4. Once your app is created, navigate to the "OAuth & Permissions" page in the sidebar.
5. Under the "Scopes" section, add the necessary OAuth scopes for your bot. The scopes define what your app can do and access.
6. Scroll up to the "OAuth Tokens for Your Workspace" section and click "Install to Workspace".
7. Follow the prompts to install your app to your workspace. Slack will then issue an OAuth Access Token.
8. Your bot token, which starts with `xoxb-`, will be displayed under "OAuth Tokens for Your Workspace" after installation.

Remember to keep your bot token secure and do not share it publicly.
```

## Create interaction

To use dialog, the bot must be configured with `Interactivity & Shortcuts`

```
1. **Create an Interactive Component**: First, ensure your Slack app has interactive components enabled. This can be done in the Slack app settings under the "Interactive Components" section. You'll need to provide a Request URL, which is the endpoint on your server where Slack will send interaction payloads.

2. **Implement an Interaction Handler**: On your server, implement an endpoint that matches the Request URL you provided. This endpoint will handle payloads from Slack whenever users interact with your app's interactive components.

3. **Trigger an Interaction**: Add an interactive component to your app, such as a button, in a message or a modal. When a user clicks this button, Slack sends an interaction payload to your Request URL.

4. **Extract the Trigger ID**: In the payload sent by Slack to your interaction handler, look for the `trigger_id` field. This ID is only valid for a short period (approximately 3 minutes), so you should use it promptly to open a dialog or modal.
```
