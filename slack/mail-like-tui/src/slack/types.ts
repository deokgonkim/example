export type AuthorKind = "user" | "bot" | "system" | "unknown";

export type MessageAuthor = {
  kind: AuthorKind;
  label: string;
  userId?: string;
  botId?: string;
  appId?: string;
};

export type DeleteEligibility =
  | {allowed: true; mode: "user" | "bot"}
  | {allowed: false; reason: string};

export type ChannelMessage = {
  ts: string;
  threadTs?: string;
  text: string;
  preview: string;
  author: MessageAuthor;
  replyCount: number;
  replyUsersCount: number;
  createdAt: string;
  subtype?: string;
  rawText?: string;
  deleteEligibility: DeleteEligibility;
};

export type ThreadMessage = {
  ts: string;
  text: string;
  author: MessageAuthor;
  createdAt: string;
  subtype?: string;
};

export type SlackIdentity = {
  userId?: string;
  botId?: string;
  label: string;
};

export type ChannelRef = {
  id: string;
  name: string;
};
