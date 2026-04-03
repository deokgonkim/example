import type {DeleteEligibility, MessageAuthor, SlackIdentity} from "./types.js";

type MessageIdentityContext = {
  user: SlackIdentity;
  bot?: SlackIdentity;
};

type RichTextStyle = {
  code?: boolean;
};

type RichTextInlineElement =
  | {type: "text"; text?: string; style?: RichTextStyle}
  | {type: "link"; url?: string; text?: string}
  | {type: "emoji"; name?: string; unicode?: string}
  | {type: "user"; user_id?: string}
  | {type: "channel"; channel_id?: string}
  | {type: "usergroup"; usergroup_id?: string}
  | {type: "broadcast"; range?: string}
  | {type: "date"; timestamp?: number; format?: string; fallback?: string}
  | {type: "color"; value?: string};

type RichTextSectionElement = {
  type: "rich_text_section";
  elements?: RichTextInlineElement[];
};

type RichTextListElement = {
  type: "rich_text_list";
  style?: "bullet" | "ordered";
  indent?: number;
  offset?: number;
  elements?: RichTextBlockElement[];
};

type RichTextQuoteElement = {
  type: "rich_text_quote";
  elements?: RichTextInlineElement[];
};

type RichTextPreformattedElement = {
  type: "rich_text_preformatted";
  elements?: RichTextInlineElement[];
};

type RichTextBlockElement =
  | RichTextSectionElement
  | RichTextListElement
  | RichTextQuoteElement
  | RichTextPreformattedElement;

type SlackRichTextBlock = {
  type: "rich_text";
  elements?: RichTextBlockElement[];
};

type SlackTextObject = {
  type?: "plain_text" | "mrkdwn";
  text?: string;
};

type SlackSectionField = SlackTextObject;

type SlackContextElement =
  | SlackTextObject
  | {
      type: "image";
      alt_text?: string;
      image_url?: string;
    };

type SlackActionsElement = {
  type?: string;
  text?: SlackTextObject;
  placeholder?: SlackTextObject;
  alt_text?: string;
  action_id?: string;
  value?: string;
};

type SlackSectionBlock = {
  type: "section";
  text?: SlackTextObject;
  fields?: SlackSectionField[];
  accessory?: SlackActionsElement;
};

type SlackHeaderBlock = {
  type: "header";
  text?: SlackTextObject;
};

type SlackContextBlock = {
  type: "context";
  elements?: SlackContextElement[];
};

type SlackDividerBlock = {
  type: "divider";
};

type SlackActionsBlock = {
  type: "actions";
  elements?: SlackActionsElement[];
};

type SlackImageBlock = {
  type: "image";
  title?: SlackTextObject;
  alt_text?: string;
  image_url?: string;
};

type SupportedSlackBlock =
  | SlackRichTextBlock
  | SlackSectionBlock
  | SlackHeaderBlock
  | SlackContextBlock
  | SlackDividerBlock
  | SlackActionsBlock
  | SlackImageBlock;

type SlackUnsupportedBlock = {
  type?: string;
  [key: string]: unknown;
};

type SlackAttachment = {
  text?: string;
  pretext?: string;
  fallback?: string;
  title?: string;
  fields?: SlackAttachmentField[];
  actions?: SlackAttachmentAction[];
};

type SlackFile = {
  title?: string;
  name?: string;
};

type SlackAttachmentField = {
  title?: string;
  value?: string;
};

type SlackAttachmentAction = {
  type?: string;
  text?: string;
  url?: string;
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
  blocks?: Array<SupportedSlackBlock | SlackUnsupportedBlock>;
  attachments?: SlackAttachment[];
  files?: SlackFile[];
};

export function renderMessageText(message: SlackMessageShape): string {
  if (Array.isArray(message.blocks) && message.blocks.length > 0) {
    const rendered = renderBlocks(message.blocks);
    if (rendered) {
      return rendered;
    }
  }

  if (message.text && message.text.trim()) {
    return message.text;
  }

  if (Array.isArray(message.blocks) && message.blocks.length > 0) {
    return "[unsupported Slack rich content]";
  }

  const attachmentText = renderAttachments(message.attachments);
  if (attachmentText) {
    return attachmentText;
  }

  const fileText = renderFiles(message.files);
  if (fileText) {
    return fileText;
  }

  return "[empty message]";
}

function renderBlocks(blocks: SlackMessageShape["blocks"]): string {
  if (!Array.isArray(blocks)) {
    return "";
  }

  return blocks
    .map((block) => renderBlock(block))
    .filter((blockText) => blockText.trim().length > 0)
    .join("\n\n")
    .trim();
}

function renderBlock(block: NonNullable<SlackMessageShape["blocks"]>[number]): string {
  switch (block.type) {
    case "rich_text":
      return renderRichTextBlock(block as SlackRichTextBlock);
    case "section":
      return renderSectionBlock(block as SlackSectionBlock);
    case "header":
      return renderTextObject((block as SlackHeaderBlock).text);
    case "context":
      return renderContextBlock(block as SlackContextBlock);
    case "divider":
      return "---";
    case "actions":
      return renderActionsBlock(block as SlackActionsBlock);
    case "image":
      return renderImageBlock(block as SlackImageBlock);
    default:
      return "";
  }
}

function renderRichTextBlock(block: SlackRichTextBlock): string {
  if (!Array.isArray(block.elements)) {
    return "";
  }

  return block.elements
    .map((element, index) => renderBlockElement(element, index))
    .filter((elementText) => elementText.trim().length > 0)
    .join("\n")
    .trim();
}

function renderSectionBlock(block: SlackSectionBlock): string {
  const parts = [
    renderTextObject(block.text),
    renderFields(block.fields),
    renderAccessory(block.accessory),
  ].filter((part) => part.length > 0);

  return parts.join("\n");
}

function renderFields(fields?: SlackSectionField[]): string {
  if (!Array.isArray(fields) || fields.length === 0) {
    return "";
  }

  return fields
    .map((field) => renderTextObject(field))
    .filter((text) => text.length > 0)
    .join("\n");
}

function renderContextBlock(block: SlackContextBlock): string {
  if (!Array.isArray(block.elements) || block.elements.length === 0) {
    return "";
  }

  return block.elements
    .map((element) => {
      if (element.type === "image") {
        return renderImagePlaceholder(element.alt_text, element.image_url);
      }

      return renderTextObject(element);
    })
    .filter((text) => text.length > 0)
    .join(" ")
    .trim();
}

function renderActionsBlock(block: SlackActionsBlock): string {
  if (!Array.isArray(block.elements) || block.elements.length === 0) {
    return "";
  }

  return block.elements
    .map((element) => renderAccessory(element))
    .filter((text) => text.length > 0)
    .join(" ")
    .trim();
}

function renderImageBlock(block: SlackImageBlock): string {
  const title = renderTextObject(block.title);
  const placeholder = renderImagePlaceholder(block.alt_text, block.image_url);

  return [title, placeholder].filter((part) => part.length > 0).join("\n");
}

function renderBlockElement(element: RichTextBlockElement, index: number): string {
  switch (element.type) {
    case "rich_text_section":
      return renderInlineElements(element.elements);
    case "rich_text_list":
      return renderList(element);
    case "rich_text_quote":
      return prefixLines(renderInlineElements(element.elements), "> ");
    case "rich_text_preformatted":
      return renderInlineElements(element.elements);
    default:
      return "";
  }
}

function renderList(list: RichTextListElement): string {
  if (!Array.isArray(list.elements) || list.elements.length === 0) {
    return "";
  }

  const baseIndent = "  ".repeat(Math.max(0, (list.indent || 0) - 1));
  const offset = list.offset || 0;

  return list.elements
    .map((element, index) => {
      const marker = list.style === "ordered" ? `${offset + index + 1}. ` : "- ";
      const itemText = renderBlockElement(element, index);
      if (!itemText) {
        return "";
      }

      return prefixFirstLine(itemText, `${baseIndent}${marker}`, `${baseIndent}  `);
    })
    .filter((item) => item.length > 0)
    .join("\n");
}

function renderInlineElements(elements?: RichTextInlineElement[]): string {
  if (!Array.isArray(elements) || elements.length === 0) {
    return "";
  }

  return elements.map((element) => renderInlineElement(element)).join("");
}

function renderTextObject(text?: SlackTextObject): string {
  return text?.text?.trim() || "";
}

function renderAccessory(accessory?: SlackActionsElement): string {
  if (!accessory?.type) {
    return "";
  }

  if (accessory.type === "image") {
    return renderImagePlaceholder(accessory.alt_text);
  }

  const label = renderTextObject(accessory.text) || renderTextObject(accessory.placeholder) || accessory.value?.trim() || accessory.action_id?.trim();
  if (!label) {
    return `[${accessory.type}]`;
  }

  switch (accessory.type) {
    case "button":
      return `[button: ${label}]`;
    case "static_select":
    case "external_select":
    case "users_select":
    case "conversations_select":
    case "channels_select":
    case "overflow":
      return `[select: ${label}]`;
    case "datepicker":
      return `[datepicker: ${label}]`;
    default:
      return `[${accessory.type}: ${label}]`;
  }
}

function renderImagePlaceholder(altText?: string, imageUrl?: string): string {
  const label = altText?.trim() || imageUrl?.trim();
  return label ? `[image: ${label}]` : "[image]";
}

function renderInlineElement(element: RichTextInlineElement): string {
  switch (element.type) {
    case "text":
      return element.text || "";
    case "link":
      if (element.text && element.url && element.text !== element.url) {
        return `${element.text} (${element.url})`;
      }

      return element.text || element.url || "";
    case "emoji":
      return element.unicode || (element.name ? `:${element.name}:` : "");
    case "user":
      return element.user_id ? `<@${element.user_id}>` : "";
    case "channel":
      return element.channel_id ? `<#${element.channel_id}>` : "";
    case "usergroup":
      return element.usergroup_id ? `<!subteam^${element.usergroup_id}>` : "";
    case "broadcast":
      return element.range ? `@${element.range}` : "";
    case "date":
      return element.fallback || "";
    case "color":
      return element.value || "";
    default:
      return "";
  }
}

function prefixLines(text: string, prefix: string): string {
  if (!text) {
    return "";
  }

  return text
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

function prefixFirstLine(text: string, firstPrefix: string, continuationPrefix: string): string {
  const [firstLine, ...rest] = text.split("\n");
  return [`${firstPrefix}${firstLine}`, ...rest.map((line) => `${continuationPrefix}${line}`)].join("\n");
}

function renderAttachments(attachments?: SlackAttachment[]): string {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return "";
  }

  return attachments
    .map((attachment) => {
      const parts = [
        attachment.pretext,
        attachment.title,
        attachment.text,
        attachment.fallback,
        renderAttachmentFields(attachment.fields),
        renderAttachmentActions(attachment.actions),
      ]
        .map((part) => part?.trim())
        .filter((part, index, all): part is string => Boolean(part) && all.indexOf(part) === index);

      return parts.join("\n");
    })
    .filter((text) => text.length > 0)
    .join("\n\n")
    .trim();
}

function renderAttachmentFields(fields?: SlackAttachmentField[]): string {
  if (!Array.isArray(fields) || fields.length === 0) {
    return "";
  }

  return fields
    .map((field) => {
      const title = field.title?.trim();
      const value = field.value?.trim();

      if (title && value) {
        return `${title}: ${value}`;
      }

      return title || value || "";
    })
    .filter((fieldText) => fieldText.length > 0)
    .join("\n");
}

function renderAttachmentActions(actions?: SlackAttachmentAction[]): string {
  if (!Array.isArray(actions) || actions.length === 0) {
    return "";
  }

  return actions
    .map((action) => {
      const label = action.text?.trim();
      const url = action.url?.trim();

      if (label && url) {
        return `[${label}] (${url})`;
      }

      if (label) {
        return `[${label}]`;
      }

      if (url) {
        return `[action] (${url})`;
      }

      return "";
    })
    .filter((actionText) => actionText.length > 0)
    .join(" ");
}

function renderFiles(files?: SlackFile[]): string {
  if (!Array.isArray(files) || files.length === 0) {
    return "";
  }

  return files
    .map((file) => file.title?.trim() || file.name?.trim() || "")
    .filter((text) => text.length > 0)
    .join("\n")
    .trim();
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
