# Minimal AI Agent

Minimal JavaScript AI agent inspired by the shape of tools like OpenClaw. It is npm-runnable and currently supports:

1. Ollama as the LLM backend
2. HTTP URL fetching
3. Telegram chat interface
4. Periodic task execution with cron syntax

## Requirements

- Node.js 18+ (tested with Node.js 22)
- A running Ollama instance
- A Telegram bot token if you want Telegram support

## Install

```bash
npm install
cp .env.example .env
```

## Configure

Edit `.env`:

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
TELEGRAM_BOT_TOKEN=
TELEGRAM_ALLOWED_CHAT_IDS=
DEFAULT_FETCH_URL=https://httpbin.org/json
CRON_SCHEDULE=*/30 * * * *
CRON_PROMPT=Give me a one sentence system heartbeat update.
CRON_FETCH_URL=
CRON_TELEGRAM_CHAT_ID=
```

### Environment variables

- `OLLAMA_BASE_URL`: Ollama server URL
- `OLLAMA_MODEL`: model name to use for generation
- `TELEGRAM_BOT_TOKEN`: enables Telegram polling when set
- `TELEGRAM_ALLOWED_CHAT_IDS`: optional comma-separated allowlist
- `DEFAULT_FETCH_URL`: used by `/run`
- `CRON_SCHEDULE`: cron expression for periodic jobs
- `CRON_PROMPT`: prompt used by cron jobs
- `CRON_FETCH_URL`: optional URL fetched before the cron prompt is sent to Ollama
- `CRON_TELEGRAM_CHAT_ID`: optional Telegram chat ID to receive cron output

## Run

```bash
npm run start
```

## Telegram commands

- `/start` or `/help`: show commands
- `/health`: show basic configuration
- `/ask <prompt>`: send prompt directly to Ollama
- `/fetch <url>`: fetch a URL and return the response body
- `/run <prompt>`: fetch `DEFAULT_FETCH_URL`, append the response to the prompt, and send it to Ollama
- Any plain text message: treated as a direct Ollama prompt

## How it works

- `src/index.js` is the full app entry point
- Ollama is called through `POST /api/generate`
- URL fetching uses native `fetch`
- Telegram uses long polling via `node-telegram-bot-api`
- Scheduled jobs use `node-cron`

## Notes

- This is intentionally minimal: no database, no memory, no queue, and no tool sandboxing
- If `TELEGRAM_BOT_TOKEN` is empty, Telegram is disabled but cron still runs
- Cron output is logged to stdout and can also be pushed to Telegram

## Project structure

```text
.
├── .env.example
├── package.json
├── README.md
└── src
    └── index.js
```

## Original instruction

```text
Create minimal ai agent like openclaw. currently support following four features
1. can utilize ollama backend
2. can call http url to fetch data
3. users can talk to agent using telegram
4. can run tasks periodically(cron capable)

create README.md and use javascript language and npm run-able

include this instruction in README.md at the bottom
```

## TBD

- [] Ollama cannot call http url on instruction.

