# `slail` Implementation Plan

## Goal
Build a terminal UI for Slack that starts with `slail <channel>`, shows recent messages for that channel, displays thread detail for the selected message, lets the user post a new message, reply in-thread, refresh manually, and delete either:

- messages authored by the authenticated user token
- messages authored by one configured bot token

## CLI Contract
- Command: `slail <channel>`
- Accept `general`, `#general`, or a channel ID
- Resolve names to IDs through Slack APIs

## Authentication Model
- `SLACK_USER_TOKEN` is required
- `SLACK_BOT_TOKEN` is optional
- User token is used for:
  - channel resolution
  - reading channel history
  - reading thread replies
  - posting new channel messages
  - posting thread replies
  - deleting messages authored by the authenticated user
- Bot token is used only for deleting messages authored by that configured bot identity

## Core User Flows
- Start the app with a channel argument and load recent history
- Navigate the left-hand message list with the keyboard
- Show selected message and replies in the right-hand pane
- Press `n` to compose a new channel message
- Press `r` to reply to the selected thread root
- Press `d` to delete the selected message when ownership rules allow it
- Press `R` to manually refresh
- Press `q` to quit

## Delete Rules
- Allow delete when the selected message belongs to the authenticated user from `SLACK_USER_TOKEN`
- Allow delete when the selected message belongs to the configured bot from `SLACK_BOT_TOKEN`
- Block all other deletions with a clear reason in the status area

## UI Layout And Keybindings
- Two-pane layout
- Left pane:
  - recent channel messages
  - author, timestamp, preview text, reply count
- Right pane:
  - selected message detail
  - thread replies
- Footer:
  - key hints
  - loading/error state
  - action feedback
- Keybindings:
  - `↑` / `↓`: move selection
  - `Enter`: focus current thread detail
  - `n`: compose a new channel message
  - `r`: reply in-thread
  - `d`: delete if allowed
  - `R`: refresh
  - `Esc`: cancel compose/reply mode
  - `q`: quit

## Slack API Responsibilities
- Resolve channel by name or ID
- Fetch recent channel messages
- Fetch replies for a selected root message
- Post channel messages
- Post thread replies
- Delete with the correct token depending on ownership
- Fetch user identity from the user token
- Fetch bot identity from the bot token when configured

## Error Handling And Non-Goals
- Handle:
  - missing token
  - missing or inaccessible channel
  - Slack API errors
  - rate limits
  - unsupported message shapes
  - blocked delete attempts
- Non-goals for v1:
  - OAuth
  - realtime event streaming
  - polling refresh
  - broad Block Kit rendering
  - pagination UI
  - deleting arbitrary messages from unrelated bots

## Test Plan
- Unit tests for channel input parsing
- Unit tests for Slack message mapping
- Unit tests for delete eligibility rules
- UI-level state tests can be added around key interactions after the first working version
- Manual validation against a real Slack workspace for read, post, reply, refresh, and both delete paths

## Assumptions
- Node + Ink
- Env-var auth only
- Manual refresh only
- Basic markdown and link rendering only, including common Slack `rich_text` block-only messages
- Initial history page is capped to a recent fixed window
