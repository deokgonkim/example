import test from "node:test";
import assert from "node:assert/strict";

import {
  clampChannelSelectionIndex,
  clampThreadScrollOffset,
  getChannelSelectionIndexForChannel,
  getMaxThreadScrollOffset,
  getVisibleThreadReplies,
  getVisibleThreadWindow,
} from "../src/ui/App.js";
import type {ChannelMessage, ChannelRef, ThreadMessage} from "../src/slack/types.js";

function makeChannelMessage(ts: string): ChannelMessage {
  return {
    ts,
    text: `message ${ts}`,
    preview: `message ${ts}`,
    author: {kind: "user", label: "user", userId: "U1"},
    replyCount: 0,
    replyUsersCount: 0,
    createdAt: "Apr 03, 10:00",
    deleteEligibility: {allowed: true, mode: "user"},
  };
}

function makeThreadMessage(ts: string): ThreadMessage {
  return {
    ts,
    text: `reply ${ts}`,
    author: {kind: "user", label: "user", userId: "U1"},
    createdAt: "Apr 03, 10:00",
  };
}

function makeChannelRef(id: string, name: string): ChannelRef {
  return {id, name};
}

test("getChannelSelectionIndexForChannel returns the current channel index when present", () => {
  const channels = [makeChannelRef("C1", "general"), makeChannelRef("C2", "alerts"), makeChannelRef("C3", "random")];

  assert.equal(getChannelSelectionIndexForChannel(channels, makeChannelRef("C2", "alerts")), 1);
});

test("getChannelSelectionIndexForChannel falls back to the first row when the channel is missing", () => {
  const channels = [makeChannelRef("C1", "general"), makeChannelRef("C2", "alerts")];

  assert.equal(getChannelSelectionIndexForChannel(channels, makeChannelRef("C9", "missing")), 0);
  assert.equal(getChannelSelectionIndexForChannel(channels), 0);
});

test("clampChannelSelectionIndex keeps picker selection inside the available channel range", () => {
  const channels = [makeChannelRef("C1", "general"), makeChannelRef("C2", "alerts")];

  assert.equal(clampChannelSelectionIndex(-1, channels), 0);
  assert.equal(clampChannelSelectionIndex(1, channels), 1);
  assert.equal(clampChannelSelectionIndex(99, channels), 1);
  assert.equal(clampChannelSelectionIndex(99, []), 0);
});

test("getVisibleThreadReplies removes the selected root message", () => {
  const selectedMessage = makeChannelMessage("100.0");
  const replies = [makeThreadMessage("100.0"), makeThreadMessage("101.0"), makeThreadMessage("102.0")];

  assert.deepEqual(
    getVisibleThreadReplies(replies, selectedMessage).map((message) => message.ts),
    ["101.0", "102.0"],
  );
});

test("getMaxThreadScrollOffset returns zero when replies fit in the viewport", () => {
  assert.equal(getMaxThreadScrollOffset(4, 6), 0);
});

test("getMaxThreadScrollOffset returns the last valid window start when replies overflow", () => {
  assert.equal(getMaxThreadScrollOffset(9, 6), 3);
});

test("clampThreadScrollOffset clamps below zero and above the last valid window", () => {
  assert.equal(clampThreadScrollOffset(-1, 10, 6), 0);
  assert.equal(clampThreadScrollOffset(99, 10, 6), 4);
});

test("getVisibleThreadWindow returns the correct reply slice for the current offset", () => {
  const replies = [
    makeThreadMessage("101.0"),
    makeThreadMessage("102.0"),
    makeThreadMessage("103.0"),
    makeThreadMessage("104.0"),
    makeThreadMessage("105.0"),
  ];

  assert.deepEqual(
    getVisibleThreadWindow(replies, 1, 3).map((message) => message.ts),
    ["102.0", "103.0", "104.0"],
  );
});

test("getVisibleThreadWindow clamps offsets before slicing", () => {
  const replies = [
    makeThreadMessage("101.0"),
    makeThreadMessage("102.0"),
    makeThreadMessage("103.0"),
    makeThreadMessage("104.0"),
    makeThreadMessage("105.0"),
  ];

  assert.deepEqual(
    getVisibleThreadWindow(replies, 20, 3).map((message) => message.ts),
    ["103.0", "104.0", "105.0"],
  );
});
