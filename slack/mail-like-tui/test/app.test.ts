import test from "node:test";
import assert from "node:assert/strict";

import {
  clampChannelSelectionIndex,
  clampThreadScrollOffset,
  formatThreadMessageLines,
  getChannelSelectionIndexForChannel,
  getMessageAreaHeight,
  getThreadContentLineBudget,
  getThreadDocumentLines,
  getMessageViewLayout,
  getMaxThreadScrollOffset,
  getPaneContentWidth,
  getPaneViewportSize,
  getPickerContainerHeight,
  getPickerViewportSize,
  getVisibleChannelWindow,
  getVisibleThreadReplies,
  getVisiblePickerWindow,
  getVisibleThreadLinesFromOffset,
  getWrappedThreadDocumentLines,
  isNarrowLayout,
  truncateLine,
  wrapLineHard,
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

test("isNarrowLayout switches below the configured breakpoint", () => {
  assert.equal(isNarrowLayout(99), true);
  assert.equal(isNarrowLayout(100), false);
});

test("getMessageAreaHeight grows with the terminal height", () => {
  assert.equal(getMessageAreaHeight(24), 20);
  assert.equal(getMessageAreaHeight(30), 26);
});

test("getMessageViewLayout returns stacked layout and compact legend for narrow terminals", () => {
  const layout = getMessageViewLayout(80, 24);

  assert.equal(layout.narrow, true);
  assert.equal(layout.containerDirection, "column");
  assert.equal(layout.messageAreaHeight, 20);
  assert.equal(layout.channelHeight, 7);
  assert.equal(layout.threadHeight, 12);
  assert.equal(layout.footerLegend, "Keys: b, Tab, ↑/↓, n, r, d, R, q");
});

test("getMessageViewLayout returns side-by-side layout for wide terminals", () => {
  const layout = getMessageViewLayout(120, 30);

  assert.equal(layout.narrow, false);
  assert.equal(layout.containerDirection, "row");
  assert.equal(layout.messageAreaHeight, 26);
  assert.equal(layout.channelHeight, 26);
  assert.equal(layout.threadHeight, 26);
  assert.equal(layout.channelWidth, "50%");
  assert.equal(layout.threadWidth, "50%");
});

test("pane viewport size reserves space for pane chrome", () => {
  assert.equal(getPaneViewportSize(12), 10);
  assert.equal(getPaneViewportSize(2), 1);
});

test("getPaneContentWidth derives a conservative pane text width", () => {
  assert.equal(getPaneContentWidth(80, true), 74);
  assert.equal(getPaneContentWidth(120, false), 54);
});

test("picker sizing helpers reserve space for borders and footer", () => {
  assert.equal(getPickerViewportSize(24), 16);
  assert.equal(getPickerContainerHeight(24), 20);
  assert.equal(getPickerViewportSize(8), 3);
  assert.equal(getPickerContainerHeight(8), 6);
});

test("getVisiblePickerWindow centers the selected channel when possible", () => {
  const channels = [
    makeChannelRef("C1", "general"),
    makeChannelRef("C2", "alerts"),
    makeChannelRef("C3", "random"),
    makeChannelRef("C4", "ops"),
    makeChannelRef("C5", "dev"),
  ];

  assert.deepEqual(
    getVisiblePickerWindow(channels, 2, 3).map((channel) => channel.id),
    ["C2", "C3", "C4"],
  );
});

test("getVisiblePickerWindow clamps at the top and bottom of the channel list", () => {
  const channels = [
    makeChannelRef("C1", "general"),
    makeChannelRef("C2", "alerts"),
    makeChannelRef("C3", "random"),
    makeChannelRef("C4", "ops"),
    makeChannelRef("C5", "dev"),
  ];

  assert.deepEqual(
    getVisiblePickerWindow(channels, 0, 3).map((channel) => channel.id),
    ["C1", "C2", "C3"],
  );
  assert.deepEqual(
    getVisiblePickerWindow(channels, 4, 3).map((channel) => channel.id),
    ["C3", "C4", "C5"],
  );
});

test("getVisibleChannelWindow centers the selected message when possible", () => {
  const messages = [
    makeChannelMessage("1"),
    makeChannelMessage("2"),
    makeChannelMessage("3"),
    makeChannelMessage("4"),
    makeChannelMessage("5"),
  ];

  assert.deepEqual(
    getVisibleChannelWindow(messages, 2, 3).map((message) => message.ts),
    ["2", "3", "4"],
  );
});

test("getVisibleThreadReplies removes the selected root message", () => {
  const selectedMessage = makeChannelMessage("100.0");
  const replies = [makeThreadMessage("100.0"), makeThreadMessage("101.0"), makeThreadMessage("102.0")];

  assert.deepEqual(
    getVisibleThreadReplies(replies, selectedMessage).map((message) => message.ts),
    ["101.0", "102.0"],
  );
});

test("getMaxThreadScrollOffset returns zero when all lines fit in the viewport", () => {
  assert.equal(getMaxThreadScrollOffset(5, 5), 0);
});

test("getMaxThreadScrollOffset returns the last valid line offset", () => {
  assert.equal(getMaxThreadScrollOffset(9, 4), 5);
});

test("clampThreadScrollOffset clamps below zero and above the last valid window", () => {
  assert.equal(clampThreadScrollOffset(-1, 10, 4), 0);
  assert.equal(clampThreadScrollOffset(99, 10, 4), 6);
});

test("getThreadDocumentLines includes the selected root followed by replies", () => {
  const selectedMessage = {
    createdAt: "Apr 03, 10:00",
    author: {kind: "user" as const, label: "root"},
    text: "root line 1\nroot line 2",
  };
  const replies = [
    {
      createdAt: "Apr 03, 10:01",
      author: {kind: "user" as const, label: "reply"},
      text: "reply line 1",
    },
  ];

  assert.deepEqual(
    getThreadDocumentLines(selectedMessage, replies),
    ["Apr 03, 10:00 root", "root line 1", "root line 2", "", "Apr 03, 10:01 reply", "reply line 1"],
  );
});

test("getVisibleThreadLinesFromOffset returns a line slice from the current offset", () => {
  const lines = ["l1", "l2", "l3", "l4", "l5"];

  assert.deepEqual(
    getVisibleThreadLinesFromOffset(lines, 1, 3),
    ["l2", "l3", "l4"],
  );
});

test("formatThreadMessageLines expands metadata and multiline body into lines", () => {
  assert.deepEqual(
    formatThreadMessageLines({
      createdAt: "Apr 03, 10:00",
      author: {kind: "user", label: "user"},
      text: "line one\nline two",
    }),
    ["Apr 03, 10:00 user", "line one", "line two"],
  );
});

test("wrapLineHard hard-wraps long lines to the target width", () => {
  assert.deepEqual(wrapLineHard("abcdefgh", 3), ["abc", "def", "gh"]);
});

test("truncateLine truncates to width with an ellipsis", () => {
  assert.equal(truncateLine("abcdefgh", 5), "abcd…");
});

test("getWrappedThreadDocumentLines wraps long thread lines before scrolling", () => {
  const selectedMessage = {
    createdAt: "Apr 03, 10:00",
    author: {kind: "user" as const, label: "root"},
    text: "abcdefgh",
  };

  assert.deepEqual(getWrappedThreadDocumentLines(selectedMessage, [], 3), [
    "Apr",
    " 03",
    ", 1",
    "0:0",
    "0 r",
    "oot",
    "abc",
    "def",
    "gh",
  ]);
});

test("getThreadContentLineBudget reserves lines for pane chrome and reply summary", () => {
  assert.equal(getThreadContentLineBudget(11, true), 7);
  assert.equal(getThreadContentLineBudget(11, false), 8);
  assert.equal(getThreadContentLineBudget(2, true), 1);
});

test("getVisibleThreadLinesFromOffset can scroll past the root into reply content", () => {
  const selectedMessage = {
    createdAt: "Apr 03, 10:00",
    author: {kind: "user" as const, label: "root"},
    text: "root line 1\nroot line 2\nroot line 3\nroot line 4",
  };
  const replies = [
    {
      createdAt: "Apr 03, 10:01",
      author: {kind: "user" as const, label: "reply"},
      text: "reply line 1\nreply line 2",
    },
  ];
  const lines = getThreadDocumentLines(selectedMessage, replies);

  assert.deepEqual(getVisibleThreadLinesFromOffset(lines, 4, 5), [
    "root line 4",
    "",
    "Apr 03, 10:01 reply",
    "reply line 1",
    "reply line 2",
  ]);
});
