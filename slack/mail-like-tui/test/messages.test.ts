import test from "node:test";
import assert from "node:assert/strict";

import {buildAuthor, createPreview, getDeleteEligibility, renderMessageText} from "../src/slack/messages.js";

test("renderMessageText renders block-only rich text sections", () => {
  assert.equal(
    renderMessageText({
      blocks: [
        {
          type: "rich_text",
          elements: [
            {
              type: "rich_text_section",
              elements: [
                {type: "text", text: "hello "},
                {type: "link", url: "https://example.com", text: "world"},
                {type: "emoji", name: "wave"},
              ],
            },
          ],
        },
      ],
    }),
    "hello world (https://example.com):wave:",
  );
});

test("renderMessageText prefers rendered blocks over fallback text", () => {
  assert.equal(
    renderMessageText({
      text: "fallback text that should not be shown",
      blocks: [
        {
          type: "rich_text",
          elements: [
            {
              type: "rich_text_section",
              elements: [{type: "text", text: "rendered block text"}],
            },
          ],
        },
      ],
    }),
    "rendered block text",
  );
});

test("renderMessageText renders rich text lists and quotes", () => {
  assert.equal(
    renderMessageText({
      blocks: [
        {
          type: "rich_text",
          elements: [
            {
              type: "rich_text_list",
              style: "ordered",
              elements: [
                {type: "rich_text_section", elements: [{type: "text", text: "first"}]},
                {type: "rich_text_section", elements: [{type: "text", text: "second"}]},
              ],
            },
            {
              type: "rich_text_quote",
              elements: [{type: "text", text: "quoted"}],
            },
          ],
        },
      ],
    }),
    "1. first\n2. second\n> quoted",
  );
});

test("renderMessageText renders preformatted blocks", () => {
  assert.equal(
    renderMessageText({
      blocks: [
        {
          type: "rich_text",
          elements: [
            {
              type: "rich_text_preformatted",
              elements: [{type: "text", text: "const x = 1;\nconst y = 2;"}],
            },
          ],
        },
      ],
    }),
    "const x = 1;\nconst y = 2;",
  );
});

test("renderMessageText renders section blocks with fields and accessory placeholders", () => {
  assert.equal(
    renderMessageText({
      blocks: [
        {
          type: "section",
          text: {type: "mrkdwn", text: "Deploy failed"},
          fields: [
            {type: "mrkdwn", text: "env: prod"},
            {type: "mrkdwn", text: "service: api"},
          ],
          accessory: {
            type: "button",
            text: {type: "plain_text", text: "Retry"},
          },
        },
      ],
    }),
    "Deploy failed\nenv: prod\nservice: api\n[button: Retry]",
  );
});

test("renderMessageText renders header, context, divider, and actions blocks", () => {
  assert.equal(
    renderMessageText({
      blocks: [
        {
          type: "header",
          text: {type: "plain_text", text: "Incident Update"},
        },
        {
          type: "context",
          elements: [
            {type: "mrkdwn", text: "owner: ops"},
            {type: "image", alt_text: "status icon"},
          ],
        },
        {
          type: "divider",
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {type: "plain_text", text: "Open"},
            },
            {
              type: "static_select",
              placeholder: {type: "plain_text", text: "Status"},
            },
          ],
        },
      ],
    }),
    "Incident Update\n\nowner: ops [image: status icon]\n\n---\n\n[button: Open] [select: Status]",
  );
});

test("renderMessageText renders image blocks and preserves partial supported output", () => {
  assert.equal(
    renderMessageText({
      blocks: [
        {
          type: "image",
          title: {type: "plain_text", text: "Architecture"},
          alt_text: "service diagram",
        },
        {
          type: "video",
        },
      ],
    }),
    "Architecture\n[image: service diagram]",
  );
});

test("renderMessageText falls back for unsupported block-only messages", () => {
  assert.equal(renderMessageText({blocks: [{}]}), "[unsupported Slack rich content]");
});

test("renderMessageText renders attachment text when top-level text is empty", () => {
  assert.equal(
    renderMessageText({
      attachments: [
        {
          pretext: "build failed",
          text: "*deploy* output",
        },
      ],
    }),
    "build failed\n*deploy* output",
  );
});

test("renderMessageText renders sample general block content instead of fallback text", () => {
  assert.equal(
    renderMessageText({
      text: "• bullet\n• list\n```func main(): Void {\n    println!(\"Hello\");\n}```",
      blocks: [
        {
          type: "rich_text",
          elements: [
            {
              type: "rich_text_list",
              style: "bullet",
              indent: 0,
              elements: [
                {type: "rich_text_section", elements: [{type: "text", text: "bullet"}]},
                {type: "rich_text_section", elements: [{type: "text", text: "list"}]},
              ],
            },
            {
              type: "rich_text_preformatted",
              elements: [{type: "text", text: "func main(): Void {\n    println!(\"Hello\");\n}"}],
            },
          ],
        },
      ],
    }),
    "- bullet\n- list\nfunc main(): Void {\n    println!(\"Hello\");\n}",
  );
});

test("renderMessageText renders attachment fields and actions from zabbix-like payloads", () => {
  assert.equal(
    renderMessageText({
      attachments: [
        {
          title: "Resolved in 3m 0s: HTTP service is down on homeassistant",
          fallback: "Resolved in 3m 0s: HTTP service is down on homeassistant",
          fields: [
            {title: "Host", value: "homeassistant [192.168.1.150]"},
            {title: "Severity", value: "Average"},
            {title: "Trigger description", value: ""},
          ],
          actions: [
            {
              type: "button",
              text: "Open in Zabbix",
              url: "https://www.ossfsc.net/zabbix/tr_events.php?triggerid=22088&eventid=3708304",
            },
          ],
        },
      ],
    }),
    "Resolved in 3m 0s: HTTP service is down on homeassistant\nHost: homeassistant [192.168.1.150]\nSeverity: Average\nTrigger description\n[Open in Zabbix] (https://www.ossfsc.net/zabbix/tr_events.php?triggerid=22088&eventid=3708304)",
  );
});

test("renderMessageText renders file metadata when text and blocks are empty", () => {
  assert.equal(
    renderMessageText({
      files: [{title: "notes.md"}],
    }),
    "notes.md",
  );
});

test("renderMessageText falls back for empty messages", () => {
  assert.equal(renderMessageText({}), "[empty message]");
});

test("buildAuthor recognizes bot messages", () => {
  const author = buildAuthor({subtype: "bot_message", bot_id: "B123", username: "deploy-bot"});
  assert.equal(author.kind, "bot");
  assert.equal(author.botId, "B123");
});

test("createPreview truncates long text", () => {
  const preview = createPreview("a".repeat(100), 10);
  assert.equal(preview, "aaaaaaaaa…");
});

test("createPreview condenses extracted rich text whitespace", () => {
  const preview = createPreview("1. first\n2. second\n> quoted");
  assert.equal(preview, "1. first 2. second > quoted");
});

test("createPreview condenses rendered block kit text", () => {
  const preview = createPreview("Incident Update\n\nowner: ops [image: status icon]\n\n---\n\n[button: Open]");
  assert.equal(preview, "Incident Update owner: ops [image: status icon] --- [button: Open]");
});

test("getDeleteEligibility allows configured user deletes", () => {
  const result = getDeleteEligibility(
    {ts: "1.0", user: "U123", text: "hello"},
    {user: {userId: "U123", label: "me"}},
  );

  assert.deepEqual(result, {allowed: true, mode: "user"});
});

test("getDeleteEligibility allows configured bot deletes", () => {
  const result = getDeleteEligibility(
    {ts: "1.0", subtype: "bot_message", bot_id: "B123", text: "hello"},
    {user: {userId: "U123", label: "me"}, bot: {botId: "B123", label: "my-bot"}},
  );

  assert.deepEqual(result, {allowed: true, mode: "bot"});
});

test("getDeleteEligibility blocks other bot messages", () => {
  const result = getDeleteEligibility(
    {ts: "1.0", subtype: "bot_message", bot_id: "B999", text: "hello"},
    {user: {userId: "U123", label: "me"}, bot: {botId: "B123", label: "my-bot"}},
  );

  assert.deepEqual(result, {allowed: false, reason: "Message belongs to a different bot"});
});
