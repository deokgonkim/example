# slail

`slail` is a mail-like terminal UI for Slack.

Current v1 capabilities:

- start with a channel name or channel ID, or pick a channel interactively if no argument is provided
- list recent messages from that channel
- display common markdown-only Slack messages that arrive as `rich_text` blocks
- read thread detail for the selected message
- post a new channel message
- reply in-thread
- delete:
  - messages sent by the authenticated user
  - messages sent by one configured bot token
- manually refresh channel and thread data

## Requirements

- Node.js 22+
- npm 10+
- a Slack user token with access to the target channel

Optional:

- a Slack bot token if you want bot-message deletion for that configured bot

## Installation

```bash
npm install
```

Global install from the local repo:

```bash
npm install -g .
```

`prepare` runs the build automatically during global install, so `slail` is linked with the compiled `dist/index.js` entrypoint.

## Configuration

You can set credentials either in your shell or in a local `.env` file.

Example `.env`:

```bash
SLACK_USER_TOKEN="xoxp-..."
SLACK_BOT_TOKEN="xoxb-..."
```

Shell-based configuration also works:

```bash
export SLACK_USER_TOKEN="xoxp-..."
export SLACK_BOT_TOKEN="xoxb-..."
```

Notes:

- `SLACK_USER_TOKEN` is required
- `SLACK_BOT_TOKEN` is optional
- bot deletion is limited to messages authored by the bot identity behind `SLACK_BOT_TOKEN`

## Slack App Setup

Add these scopes to your Slack app before creating tokens for `slail`.

User token scopes:

- `channels:read`
- `channels:history`
- `chat:write`

Add these too if you want to use private channels:

- `groups:read`
- `groups:history`

Bot token scopes:

- `chat:write`

Why these are needed:

- channel lookup uses `conversations.list` and `conversations.info`
- message and thread loading use `conversations.history` and `conversations.replies`
- posting, replying, and deleting use `chat.postMessage` and `chat.delete`

Notes:

- `SLACK_USER_TOKEN` is the main token for reading, posting, replying, and deleting your own messages
- `SLACK_BOT_TOKEN` is only used to delete messages created by that configured bot
- if you only use public channels, you can skip the `groups:*` scopes

## Run

Development mode:

```bash
npm run dev -- general
```

Or open the channel picker:

```bash
npm run dev
```

Build and run:

```bash
npm run build
node dist/index.js general
```

You can pass:

- `general`
- `#general`
- a channel ID such as `C0123456789`
- or no argument to choose from a channel list inside the TUI

## Keybindings

- `b`: return to the channel picker
- `Tab`: switch focus between the channel and thread panes
- `↑` / `↓`: move selection in the focused pane
- `Enter`: open the highlighted channel from the picker
- `n`: compose a new channel message
- `r`: reply to the selected thread
- `d`: delete the selected message if allowed
- `R`: refresh messages and thread detail
- `Esc`: cancel compose or reply mode
- `q`: quit

## Delete Rules

`slail` only deletes messages when one of these is true:

- the message was authored by the authenticated user from `SLACK_USER_TOKEN`
- the message was authored by the configured bot from `SLACK_BOT_TOKEN`

All other delete attempts are blocked in-app.

## Development

Run tests:

```bash
npm test
```

Build:

```bash
npm run build
```

Implementation details and decisions are documented in [PLAN.md](./PLAN.md).

## Limitations

v1 intentionally does not include:

- OAuth install flow
- realtime sync or polling
- broad Block Kit rendering beyond common markdown-only `rich_text` messages
- pagination UI
- deletion of arbitrary bot messages from other apps
