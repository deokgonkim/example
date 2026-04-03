import test from "node:test";
import assert from "node:assert/strict";

import {parseCliArgs} from "../src/cli.js";
import {looksLikeChannelId, normalizeChannelInput} from "../src/slack/channel.js";

test("normalizeChannelInput removes a leading hash", () => {
  assert.equal(normalizeChannelInput("#general"), "general");
});

test("looksLikeChannelId detects Slack-style channel IDs", () => {
  assert.equal(looksLikeChannelId("C1234567890"), true);
  assert.equal(looksLikeChannelId("#general"), false);
});

test("parseCliArgs allows starting without a channel", () => {
  assert.deepEqual(parseCliArgs(["node", "slail"]), {channelInput: undefined});
});
