import "dotenv/config";
import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";

const config = {
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3.2",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  allowedChatIds: new Set(
    (process.env.TELEGRAM_ALLOWED_CHAT_IDS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  ),
  defaultFetchUrl: process.env.DEFAULT_FETCH_URL || "https://httpbin.org/json",
  cronSchedule: process.env.CRON_SCHEDULE || "*/30 * * * *",
  cronPrompt: process.env.CRON_PROMPT || "Give me a one sentence system heartbeat update.",
  cronFetchUrl: process.env.CRON_FETCH_URL || "",
  cronTelegramChatId: process.env.CRON_TELEGRAM_CHAT_ID || ""
};

function isChatAllowed(chatId) {
  if (config.allowedChatIds.size === 0) {
    return true;
  }

  return config.allowedChatIds.has(String(chatId));
}

async function fetchUrl(url) {
  const response = await fetch(url);
  const text = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    url: response.url,
    body: text.slice(0, 4000)
  };
}

async function askOllama(prompt) {
  const response = await fetch(`${config.ollamaBaseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.ollamaModel,
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.response?.trim() || "";
}

async function runAgentTask({ prompt, fetchTarget }) {
  const parts = [];

  if (fetchTarget) {
    const fetched = await fetchUrl(fetchTarget);
    parts.push(
      [
        `Fetched URL: ${fetched.url}`,
        `HTTP status: ${fetched.status}`,
        "Response body:",
        fetched.body
      ].join("\n")
    );
  }

  if (prompt) {
    const fullPrompt = [prompt, ...parts].join("\n\n");
    const answer = await askOllama(fullPrompt);

    return {
      fetched: parts.length > 0 ? parts.join("\n\n") : "",
      answer
    };
  }

  return {
    fetched: parts.join("\n\n"),
    answer: ""
  };
}

function formatTaskResult(result) {
  return [result.answer, result.fetched].filter(Boolean).join("\n\n").slice(0, 4000);
}

async function handleTelegramMessage(bot, msg) {
  const chatId = msg.chat.id;

  if (!isChatAllowed(chatId)) {
    await bot.sendMessage(chatId, "This chat is not allowed.");
    return;
  }

  const text = (msg.text || "").trim();

  if (!text) {
    return;
  }

  if (text === "/start" || text === "/help") {
    await bot.sendMessage(
      chatId,
      [
        "Commands:",
        "/ask <prompt> - send a prompt to Ollama",
        "/fetch <url> - fetch a URL",
        "/run <prompt> - fetch DEFAULT_FETCH_URL and send both to Ollama",
        "/health - basic status"
      ].join("\n")
    );
    return;
  }

  if (text === "/health") {
    await bot.sendMessage(
      chatId,
      `ok\nmodel=${config.ollamaModel}\ncron=${config.cronSchedule}\ndefaultFetchUrl=${config.defaultFetchUrl}`
    );
    return;
  }

  if (text.startsWith("/fetch ")) {
    const url = text.slice("/fetch ".length).trim();
    const fetched = await fetchUrl(url);
    await bot.sendMessage(
      chatId,
      [`URL: ${fetched.url}`, `Status: ${fetched.status}`, "", fetched.body].join("\n").slice(0, 4000)
    );
    return;
  }

  if (text.startsWith("/ask ")) {
    const prompt = text.slice("/ask ".length).trim();
    const answer = await askOllama(prompt);
    await bot.sendMessage(chatId, answer.slice(0, 4000));
    return;
  }

  if (text.startsWith("/run ")) {
    const prompt = text.slice("/run ".length).trim();
    const result = await runAgentTask({
      prompt,
      fetchTarget: config.defaultFetchUrl
    });
    await bot.sendMessage(chatId, formatTaskResult(result));
    return;
  }

  const answer = await askOllama(text);
  await bot.sendMessage(chatId, answer.slice(0, 4000));
}

function startCron(bot) {
  cron.schedule(config.cronSchedule, async () => {
    try {
      const result = await runAgentTask({
        prompt: config.cronPrompt,
        fetchTarget: config.cronFetchUrl || undefined
      });

      const message = formatTaskResult(result) || "Cron task completed with no output.";
      console.log(`[cron] ${new Date().toISOString()} ${message}`);

      if (bot && config.cronTelegramChatId) {
        await bot.sendMessage(config.cronTelegramChatId, message);
      }
    } catch (error) {
      const message = `[cron] ${new Date().toISOString()} ${error.message}`;
      console.error(message);

      if (bot && config.cronTelegramChatId) {
        await bot.sendMessage(config.cronTelegramChatId, message);
      }
    }
  });
}

async function main() {
  let bot = null;

  if (config.telegramBotToken) {
    bot = new TelegramBot(config.telegramBotToken, { polling: true });
    bot.on("message", async (msg) => {
      try {
        await handleTelegramMessage(bot, msg);
      } catch (error) {
        await bot.sendMessage(msg.chat.id, `Error: ${error.message}`.slice(0, 4000));
      }
    });
    console.log("Telegram bot polling started.");
  } else {
    console.log("TELEGRAM_BOT_TOKEN is not set. Telegram support is disabled.");
  }

  startCron(bot);
  console.log(`Cron scheduler started with "${config.cronSchedule}".`);
  console.log(`Using Ollama model "${config.ollamaModel}" at ${config.ollamaBaseUrl}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
