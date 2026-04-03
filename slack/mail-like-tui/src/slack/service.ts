import {WebClient, type ConversationsHistoryResponse, type ConversationsRepliesResponse} from "@slack/web-api";

import {looksLikeChannelId, normalizeChannelInput} from "./channel.js";
import {buildAuthor, createPreview, getDeleteEligibility, renderMessageText, toSlackDate, type SlackMessageShape} from "./messages.js";
import type {AppConfig} from "../config.js";
import type {ChannelMessage, ChannelRef, SlackIdentity, ThreadMessage} from "./types.js";

type IdentityBundle = {
  user: SlackIdentity;
  bot?: SlackIdentity;
};

export class SlackService {
  private readonly userClient: WebClient;
  private readonly botClient?: WebClient;

  constructor(private readonly config: AppConfig) {
    this.userClient = new WebClient(config.userToken);
    this.botClient = config.botToken ? new WebClient(config.botToken) : undefined;
  }

  async getIdentities(): Promise<IdentityBundle> {
    const userAuth = await this.userClient.auth.test();
    const user = {
      userId: userAuth.user_id,
      label: userAuth.user || userAuth.user_id || "user",
    };

    if (!this.botClient) {
      return {user};
    }

    const botAuth = await this.botClient.auth.test();
    const bot: SlackIdentity = {
      userId: botAuth.user_id,
      botId: "bot_id" in botAuth ? botAuth.bot_id : undefined,
      label: botAuth.user || botAuth.bot_id || "bot",
    };

    return {user, bot};
  }

  async resolveChannel(input: string): Promise<ChannelRef> {
    const normalized = normalizeChannelInput(input);

    if (looksLikeChannelId(normalized)) {
      const info = await this.userClient.conversations.info({channel: normalized});
      const channel = info.channel;
      if (!channel?.id) {
        throw new Error(`Channel ${normalized} was not found`);
      }

      return {
        id: channel.id,
        name: channel.name || normalized,
      };
    }

    let cursor: string | undefined;
    do {
      const page = await this.userClient.conversations.list({
        limit: 200,
        types: "public_channel,private_channel",
        cursor,
      });
      const found = page.channels?.find((channel) => channel.name === normalized);
      if (found?.id) {
        return {
          id: found.id,
          name: found.name || normalized,
        };
      }
      cursor = page.response_metadata?.next_cursor || undefined;
    } while (cursor);

    throw new Error(`Channel "${normalized}" was not found`);
  }

  async listChannels(): Promise<ChannelRef[]> {
    const channels: ChannelRef[] = [];
    let cursor: string | undefined;

    do {
      const page = await this.userClient.conversations.list({
        limit: 200,
        types: "public_channel,private_channel",
        exclude_archived: true,
        cursor,
      });

      for (const channel of page.channels || []) {
        if (!channel.id || !channel.name) {
          continue;
        }

        channels.push({
          id: channel.id,
          name: channel.name,
        });
      }

      cursor = page.response_metadata?.next_cursor || undefined;
    } while (cursor);

    return channels.sort((a, b) => a.name.localeCompare(b.name));
  }

  async fetchChannelMessages(channelId: string, identities: IdentityBundle): Promise<ChannelMessage[]> {
    const response: ConversationsHistoryResponse = await this.userClient.conversations.history({
      channel: channelId,
      limit: 50,
      inclusive: true,
    });

    return (response.messages || [])
      .map((message) => this.mapChannelMessage(message as SlackMessageShape, identities))
      .filter((message): message is ChannelMessage => Boolean(message))
      .sort((a, b) => Number(b.ts) - Number(a.ts));
  }

  async fetchThreadMessages(channelId: string, rootTs: string): Promise<ThreadMessage[]> {
    const response: ConversationsRepliesResponse = await this.userClient.conversations.replies({
      channel: channelId,
      ts: rootTs,
      limit: 50,
      inclusive: true,
    });

    return (response.messages || [])
      .map((message) => this.mapThreadMessage(message as SlackMessageShape))
      .filter((message): message is ThreadMessage => Boolean(message))
      .sort((a, b) => Number(a.ts) - Number(b.ts));
  }

  async postChannelMessage(channelId: string, text: string): Promise<void> {
    await this.userClient.chat.postMessage({
      channel: channelId,
      text,
    });
  }

  async replyToMessage(channelId: string, threadTs: string, text: string): Promise<void> {
    await this.userClient.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      text,
    });
  }

  async deleteMessage(channelId: string, message: ChannelMessage): Promise<void> {
    if (!message.deleteEligibility.allowed) {
      throw new Error(message.deleteEligibility.reason);
    }

    const client = message.deleteEligibility.mode === "bot" ? this.botClient : this.userClient;
    if (!client) {
      throw new Error("Bot deletion is not configured");
    }

    await client.chat.delete({
      channel: channelId,
      ts: message.ts,
    });
  }

  private mapChannelMessage(message: SlackMessageShape, identities: IdentityBundle): ChannelMessage | null {
    if (!message.ts) {
      return null;
    }

    const text = renderMessageText(message);
    const author = buildAuthor(message);
    const deleteEligibility = getDeleteEligibility(message, identities);

    return {
      ts: message.ts,
      threadTs: message.thread_ts,
      text,
      preview: createPreview(text),
      author,
      replyCount: message.reply_count || 0,
      replyUsersCount: message.reply_users_count || 0,
      createdAt: toSlackDate(message.ts),
      subtype: message.subtype,
      rawText: message.text,
      deleteEligibility,
    };
  }

  private mapThreadMessage(message: SlackMessageShape): ThreadMessage | null {
    if (!message.ts) {
      return null;
    }

    return {
      ts: message.ts,
      text: renderMessageText(message),
      author: buildAuthor(message),
      createdAt: toSlackDate(message.ts),
      subtype: message.subtype,
    };
  }
}
