import test from "node:test";
import assert from "node:assert/strict";

import {buildAuthor, createPreview, getDeleteEligibility, renderMessageText} from "../src/slack/messages.js";

test("renderMessageText falls back for block-only messages", () => {
  assert.equal(renderMessageText({blocks: [{}]}), "[unsupported Slack rich content]");
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
