import type {DeleteEligibility, MessageAuthor, SlackIdentity} from "./types.js";

type MessageIdentityContext = {
  user: SlackIdentity;
  bot?: SlackIdentity;
};

export type SlackMessageShape = {
  ts?: string;
  text?: string;
  subtype?: string;
  user?: string;
  username?: string;
  bot_id?: string;
  app_id?: string;
  reply_count?: number;
  reply_users_count?: number;
  thread_ts?: string;
  blocks?: unknown[];
};

export function renderMessageText(message: SlackMessageShape): string {
  if (message.text && message.text.trim()) {
    return message.text;
  }

  if (Array.isArray(message.blocks) && message.blocks.length > 0) {
    return "[unsupported Slack rich content]";
  }

  return "[empty message]";
}

export function buildAuthor(message: SlackMessageShape): MessageAuthor {
  if (message.subtype === "bot_message" || message.bot_id) {
    return {
      kind: "bot",
      label: message.username || "bot",
      userId: message.user,
      botId: message.bot_id,
      appId: message.app_id,
    };
  }

  if (message.user) {
    return {
      kind: "user",
      label: message.username || message.user,
      userId: message.user,
    };
  }

  if (message.subtype) {
    return {
      kind: "system",
      label: message.subtype,
    };
  }

  return {
    kind: "unknown",
    label: "unknown",
  };
}

export function createPreview(text: string, maxLength = 72): string {
  const condensed = text.replace(/\s+/g, " ").trim();
  if (condensed.length <= maxLength) {
    return condensed;
  }

  return `${condensed.slice(0, maxLength - 1)}…`;
}

export function toSlackDate(ts: string): string {
  const millis = Number(ts.split(".")[0]) * 1000;
  if (!Number.isFinite(millis) || millis <= 0) {
    return ts;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(millis));
}

export function getDeleteEligibility(
  message: SlackMessageShape,
  identities: MessageIdentityContext,
): DeleteEligibility {
  if (!message.ts) {
    return {allowed: false, reason: "Message is missing a timestamp"};
  }

  if (message.subtype && message.subtype !== "bot_message") {
    return {allowed: false, reason: `Cannot delete ${message.subtype} messages`};
  }

  if (message.user && identities.user.userId && message.user === identities.user.userId) {
    return {allowed: true, mode: "user"};
  }

  if (identities.bot) {
    const botUserMatch = Boolean(message.user && identities.bot.userId && message.user === identities.bot.userId);
    const botIdMatch = Boolean(message.bot_id && identities.bot.botId && message.bot_id === identities.bot.botId);

    if (botUserMatch || botIdMatch) {
      return {allowed: true, mode: "bot"};
    }
  }

  if (message.subtype === "bot_message" || message.bot_id) {
    return {allowed: false, reason: "Message belongs to a different bot"};
  }

  if (message.user) {
    return {allowed: false, reason: "Message belongs to a different user"};
  }

  return {allowed: false, reason: "Unsupported message type"};
}
