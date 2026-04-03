import React, {useEffect, useMemo, useState} from "react";
import {Box, Text, useApp, useInput, useStdout} from "ink";
import TextInput from "ink-text-input";

import type {ChannelMessage, ChannelRef, ThreadMessage} from "../slack/types.js";
import {SlackService} from "../slack/service.js";

type ComposerMode = "new" | "reply";
type ViewMode = "picker" | "messages";
type PaneFocus = "channel" | "thread";

const NARROW_LAYOUT_BREAKPOINT = 100;
const APP_RESERVED_ROWS = 4;
const MIN_MESSAGE_AREA_HEIGHT = 10;
const MIN_NARROW_CHANNEL_HEIGHT = 5;
const MIN_NARROW_THREAD_HEIGHT = 6;
const THREAD_PANE_CHROME_LINES = 3;

export function getPaneContentWidth(columns: number, narrow: boolean): number {
  const usableColumns = Math.max(10, columns - 6);
  if (narrow) {
    return usableColumns;
  }

  return Math.max(10, Math.floor((usableColumns - 1) / 2) - 2);
}

export function wrapLineHard(text: string, width: number): string[] {
  const safeWidth = Math.max(1, width);
  const chars = Array.from(text);

  if (chars.length === 0) {
    return [""];
  }

  const lines: string[] = [];
  for (let index = 0; index < chars.length; index += safeWidth) {
    lines.push(chars.slice(index, index + safeWidth).join(""));
  }

  return lines;
}

export function wrapTextToWidth(text: string, width: number): string[] {
  return text.split("\n").flatMap((line) => wrapLineHard(line, width));
}

export function truncateLine(text: string, width: number): string {
  const safeWidth = Math.max(1, width);
  const chars = Array.from(text);

  if (chars.length <= safeWidth) {
    return text;
  }

  if (safeWidth === 1) {
    return chars[0];
  }

  return `${chars.slice(0, safeWidth - 1).join("")}…`;
}

export function isNarrowLayout(columns: number, breakpoint = NARROW_LAYOUT_BREAKPOINT): boolean {
  return columns < breakpoint;
}

export function getPickerViewportSize(rows: number): number {
  return Math.max(3, rows - 8);
}

export function getPickerContainerHeight(rows: number): number {
  return Math.max(6, rows - 4);
}

export function getVisiblePickerWindow(
  channels: ChannelRef[],
  selectionIndex: number,
  viewportSize: number,
): ChannelRef[] {
  if (channels.length === 0) {
    return [];
  }

  const clampedIndex = clampChannelSelectionIndex(selectionIndex, channels);
  const maxStart = Math.max(0, channels.length - viewportSize);
  const start = Math.min(maxStart, Math.max(0, clampedIndex - Math.floor(viewportSize / 2)));
  return channels.slice(start, start + viewportSize);
}

export function getMessageAreaHeight(rows: number): number {
  return Math.max(MIN_MESSAGE_AREA_HEIGHT, rows - APP_RESERVED_ROWS);
}

export function getMessageViewLayout(columns: number, rows: number): {
  messageAreaHeight: number;
  narrow: boolean;
  containerDirection: "row" | "column";
  channelWidth?: string;
  threadWidth?: string;
  channelHeight: number;
  threadHeight: number;
  paneGapMarginLeft?: number;
  paneGapMarginTop?: number;
  footerLegend: string;
} {
  const messageAreaHeight = getMessageAreaHeight(rows);

  if (isNarrowLayout(columns)) {
    const stackedHeight = Math.max(MIN_NARROW_CHANNEL_HEIGHT + MIN_NARROW_THREAD_HEIGHT + 1, messageAreaHeight);
    const usableHeight = stackedHeight - 1;
    const channelHeight = Math.max(
      MIN_NARROW_CHANNEL_HEIGHT,
      Math.min(usableHeight - MIN_NARROW_THREAD_HEIGHT, Math.floor(usableHeight * 0.4)),
    );
    const threadHeight = usableHeight - channelHeight;

    return {
      messageAreaHeight,
      narrow: true,
      containerDirection: "column",
      channelHeight,
      threadHeight,
      paneGapMarginTop: 1,
      footerLegend: "Keys: b, Tab, ↑/↓, n, r, d, R, q",
    };
  }

  return {
    messageAreaHeight,
    narrow: false,
    containerDirection: "row",
    channelWidth: "50%",
    threadWidth: "50%",
    channelHeight: messageAreaHeight,
    threadHeight: messageAreaHeight,
    paneGapMarginLeft: 1,
    footerLegend: "Keys: b channels, Tab switch pane, ↑/↓ act on focused pane, n new, r reply, d delete, R refresh, q quit",
  };
}

export function getChannelSelectionIndexForChannel(channels: ChannelRef[], channel?: ChannelRef): number {
  if (!channel || channels.length === 0) {
    return 0;
  }

  const index = channels.findIndex((item) => item.id === channel.id);
  return index >= 0 ? index : 0;
}

export function clampChannelSelectionIndex(index: number, channels: ChannelRef[]): number {
  if (channels.length === 0) {
    return 0;
  }

  return Math.max(0, Math.min(index, channels.length - 1));
}

export function getVisibleThreadReplies(threadMessages: ThreadMessage[], selectedMessage?: ChannelMessage): ThreadMessage[] {
  if (!selectedMessage) {
    return [];
  }

  return threadMessages.filter((message) => message.ts !== selectedMessage.ts);
}

export function getPaneViewportSize(height: number): number {
  return Math.max(1, height - 2);
}

export function getVisibleChannelWindow(
  messages: ChannelMessage[],
  selectionIndex: number,
  viewportSize: number,
): ChannelMessage[] {
  if (messages.length === 0) {
    return [];
  }

  const clampedIndex = Math.max(0, Math.min(selectionIndex, messages.length - 1));
  const maxStart = Math.max(0, messages.length - viewportSize);
  const start = Math.min(maxStart, Math.max(0, clampedIndex - Math.floor(viewportSize / 2)));
  return messages.slice(start, start + viewportSize);
}

export function getMaxThreadScrollOffset(lineCount: number, lineBudget: number): number {
  return Math.max(0, lineCount - lineBudget);
}

export function clampThreadScrollOffset(offset: number, lineCount: number, lineBudget: number): number {
  return Math.max(0, Math.min(offset, getMaxThreadScrollOffset(lineCount, lineBudget)));
}

export function getVisibleThreadLinesFromOffset(
  lines: string[],
  offset: number,
  lineBudget: number,
): string[] {
  const start = clampThreadScrollOffset(offset, lines.length, lineBudget);
  return lines.slice(start, start + lineBudget);
}

export function formatThreadMessageLines(message: Pick<ThreadMessage, "createdAt" | "author" | "text">): string[] {
  return [
    `${message.createdAt} ${message.author.label}`,
    ...message.text.split("\n"),
  ];
}

export function getThreadContentLineBudget(threadHeight: number, hasReplySummary: boolean): number {
  return Math.max(1, threadHeight - THREAD_PANE_CHROME_LINES - (hasReplySummary ? 1 : 0));
}

export function getThreadDocumentLines(
  selectedMessage: Pick<ChannelMessage, "createdAt" | "author" | "text">,
  replies: Array<Pick<ThreadMessage, "createdAt" | "author" | "text">>,
): string[] {
  const lines: string[] = [];
  lines.push(...formatThreadMessageLines(selectedMessage));

  for (const reply of replies) {
    lines.push("", ...formatThreadMessageLines(reply));
  }

  return lines;
}

export function getWrappedThreadDocumentLines(
  selectedMessage: Pick<ChannelMessage, "createdAt" | "author" | "text">,
  replies: Array<Pick<ThreadMessage, "createdAt" | "author" | "text">>,
  width: number,
): string[] {
  return getThreadDocumentLines(selectedMessage, replies).flatMap((line) => wrapLineHard(line, width));
}

type AppProps = {
  channelInput?: string;
  service: SlackService;
};

type AsyncState = {
  loading: boolean;
  error?: string;
  status?: string;
};

export function App({channelInput, service}: AppProps) {
  const {exit} = useApp();
  const {stdout} = useStdout();
  const [viewMode, setViewMode] = useState<ViewMode>("messages");
  const [availableChannels, setAvailableChannels] = useState<ChannelRef[]>([]);
  const [channelSelectionIndex, setChannelSelectionIndex] = useState(0);
  const [channel, setChannel] = useState<ChannelRef>();
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [composerMode, setComposerMode] = useState<ComposerMode>();
  const [composerValue, setComposerValue] = useState("");
  const [paneFocus, setPaneFocus] = useState<PaneFocus>("channel");
  const [threadScrollOffset, setThreadScrollOffset] = useState(0);
  const [asyncState, setAsyncState] = useState<AsyncState>({loading: true});
  const [refreshToken, setRefreshToken] = useState(0);

  const selectedMessage = messages[selectedIndex];
  const terminalColumns = stdout?.columns || 80;
  const terminalRows = stdout?.rows || 24;
  const layout = useMemo(() => getMessageViewLayout(terminalColumns, terminalRows), [terminalColumns, terminalRows]);
  const paneContentWidth = useMemo(() => getPaneContentWidth(terminalColumns, layout.narrow), [terminalColumns, layout.narrow]);
  const pickerContainerHeight = useMemo(() => getPickerContainerHeight(terminalRows), [terminalRows]);
  const pickerViewportSize = useMemo(() => getPickerViewportSize(terminalRows), [terminalRows]);
  const channelViewportSize = useMemo(() => getPaneViewportSize(layout.channelHeight), [layout.channelHeight]);
  const visiblePickerChannels = useMemo(
    () => getVisiblePickerWindow(availableChannels, channelSelectionIndex, pickerViewportSize),
    [availableChannels, channelSelectionIndex, pickerViewportSize],
  );
  const visiblePickerStartIndex = useMemo(() => {
    if (visiblePickerChannels.length === 0) {
      return 0;
    }

    return availableChannels.findIndex((channel) => channel.id === visiblePickerChannels[0]?.id);
  }, [availableChannels, visiblePickerChannels]);
  const threadReplies = useMemo(
    () => getVisibleThreadReplies(threadMessages, selectedMessage),
    [selectedMessage, threadMessages],
  );
  const visibleChannelMessages = useMemo(
    () => getVisibleChannelWindow(messages, selectedIndex, channelViewportSize),
    [messages, selectedIndex, channelViewportSize],
  );
  const visibleChannelStartIndex = useMemo(() => {
    if (visibleChannelMessages.length === 0) {
      return 0;
    }

    return messages.findIndex((message) => message.ts === visibleChannelMessages[0]?.ts);
  }, [messages, visibleChannelMessages]);
  const threadDocumentLines = useMemo(
    () => (selectedMessage ? getWrappedThreadDocumentLines(selectedMessage, threadReplies, paneContentWidth) : []),
    [selectedMessage, threadReplies, paneContentWidth],
  );
  const threadHasReplySummary = threadReplies.length > 0;
  const threadContentLineBudget = useMemo(
    () => getThreadContentLineBudget(layout.threadHeight || 0, threadHasReplySummary),
    [layout.threadHeight, threadHasReplySummary],
  );
  const visibleThreadLines = useMemo(
    () => getVisibleThreadLinesFromOffset(threadDocumentLines, threadScrollOffset, threadContentLineBudget),
    [threadDocumentLines, threadScrollOffset, threadContentLineBudget],
  );
  const maxThreadScrollOffset = useMemo(
    () => getMaxThreadScrollOffset(threadDocumentLines.length, threadContentLineBudget),
    [threadDocumentLines.length, threadContentLineBudget],
  );

  async function openChannelPicker() {
    setAsyncState({loading: true, status: "Loading channel list…"});

    try {
      const channels = availableChannels.length > 0 ? availableChannels : await service.listChannels();
      setAvailableChannels(channels);
      setChannelSelectionIndex((current) => {
        const preferredIndex = getChannelSelectionIndexForChannel(channels, channel);
        return channels.some((item) => item.id === channel?.id) ? preferredIndex : clampChannelSelectionIndex(current, channels);
      });
      setViewMode("picker");
      setPaneFocus("channel");
      setThreadScrollOffset(0);
      setAsyncState({
        loading: false,
        status: `Select a channel (${channels.length} available)`,
      });
    } catch (error) {
      setAsyncState({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setAsyncState({loading: true});

      try {
        const identities = await service.getIdentities();

        if (cancelled) {
          return;
        }

        if (!channelInput && !channel) {
          const channels = await service.listChannels();
          if (cancelled) {
            return;
          }

          setAvailableChannels(channels);
          setViewMode("picker");
          setChannelSelectionIndex((current) => clampChannelSelectionIndex(current, channels));
          setAsyncState({
            loading: false,
            status: `Select a channel (${channels.length} available)`,
          });
          return;
        }

        const targetChannel = channel ?? (channelInput ? await service.resolveChannel(channelInput) : undefined);
        if (!targetChannel) {
          throw new Error("No channel selected");
        }

        const history = await service.fetchChannelMessages(targetChannel.id, identities);
        if (cancelled) {
          return;
        }

        setViewMode("messages");
        setChannel(targetChannel);
        setMessages(history);
        setPaneFocus("channel");
        setThreadScrollOffset(0);
        setSelectedIndex((current) => {
          if (history.length === 0) {
            return 0;
          }

          return Math.min(current, history.length - 1);
        });
        setAsyncState({
          loading: false,
          status: `Loaded ${history.length} messages from #${targetChannel.name}`,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setAsyncState({
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [channelInput, refreshToken, service]);

  useEffect(() => {
    let cancelled = false;

    async function loadThread() {
      if (!channel || !selectedMessage) {
        setThreadMessages([]);
        setThreadScrollOffset(0);
        return;
      }

      setAsyncState((current) => ({
        ...current,
        loading: true,
        error: undefined,
      }));

      try {
        const replies = await service.fetchThreadMessages(channel.id, selectedMessage.threadTs || selectedMessage.ts);
        if (cancelled) {
          return;
        }

        setThreadMessages(replies);
        setPaneFocus("channel");
        setThreadScrollOffset(0);
        setAsyncState((current) => ({
          ...current,
          loading: false,
          status: `Viewing thread for ${selectedMessage.author.label}`,
        }));
      } catch (error) {
        if (cancelled) {
          return;
        }

        setAsyncState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        }));
      }
    }

    void loadThread();

    return () => {
      cancelled = true;
    };
  }, [channel, selectedMessage, service]);

  useEffect(() => {
    setThreadScrollOffset((current) => clampThreadScrollOffset(current, threadDocumentLines.length, threadContentLineBudget));
  }, [threadDocumentLines.length, threadContentLineBudget]);

  useInput((input, key) => {
    if (composerMode) {
      if (key.escape) {
        setComposerMode(undefined);
        setComposerValue("");
        setAsyncState((current) => ({...current, status: "Cancelled draft"}));
      }
      return;
    }

    if (input === "q") {
      exit();
      return;
    }

    if (viewMode === "picker") {
      if (key.upArrow) {
        setChannelSelectionIndex((current) => Math.max(0, current - 1));
        return;
      }

      if (key.downArrow) {
        setChannelSelectionIndex((current) => Math.min(availableChannels.length - 1, current + 1));
        return;
      }

      if (key.return && availableChannels[channelSelectionIndex]) {
        setChannel(availableChannels[channelSelectionIndex]);
        setMessages([]);
        setThreadMessages([]);
        setSelectedIndex(0);
        setRefreshToken((value) => value + 1);
        setAsyncState({loading: true, status: `Loading #${availableChannels[channelSelectionIndex].name}…`});
      }

      return;
    }

    if (input === "b") {
      void openChannelPicker();
      return;
    }

    if (key.tab || input === "\t") {
      setPaneFocus((current) => (current === "channel" ? "thread" : "channel"));
      return;
    }

    if (input === "n") {
      setComposerMode("new");
      setComposerValue("");
      setAsyncState((current) => ({...current, status: "Compose new message"}));
      return;
    }

    if (input === "r" && selectedMessage) {
      setComposerMode("reply");
      setComposerValue("");
      setAsyncState((current) => ({...current, status: "Reply in thread"}));
      return;
    }

    if (input === "R") {
      setRefreshToken((value) => value + 1);
      setAsyncState((current) => ({...current, loading: true, status: "Refreshing…"}));
      return;
    }

    if (input === "d" && channel && selectedMessage) {
      void handleDelete(channel.id, selectedMessage);
      return;
    }

    if (key.upArrow) {
      if (paneFocus === "thread") {
        setThreadScrollOffset((current) => Math.max(0, current - 1));
        return;
      }

      setSelectedIndex((current) => Math.max(0, current - 1));
      return;
    }

    if (key.downArrow) {
      if (paneFocus === "thread") {
        setThreadScrollOffset((current) => Math.min(maxThreadScrollOffset, current + 1));
        return;
      }

      setSelectedIndex((current) => Math.min(messages.length - 1, current + 1));
    }
  });

  const footer = useMemo(() => {
    if (asyncState.error) {
      return <Text color="red">Error: {asyncState.error}</Text>;
    }

    if (asyncState.loading) {
      return <Text color="yellow">Loading…</Text>;
    }

    return <Text color="green">{asyncState.status || "Ready"}</Text>;
  }, [asyncState]);

  async function handleSubmit(value: string) {
    if (!channel) {
      return;
    }

    const text = value.trim();
    if (!text) {
      setComposerMode(undefined);
      setComposerValue("");
      setAsyncState((current) => ({...current, status: "Ignored empty message"}));
      return;
    }

    setAsyncState((current) => ({...current, loading: true, error: undefined}));

    try {
      if (composerMode === "new") {
        await service.postChannelMessage(channel.id, text);
        setAsyncState({loading: false, status: "Posted new message"});
      } else if (selectedMessage) {
        await service.replyToMessage(channel.id, selectedMessage.threadTs || selectedMessage.ts, text);
        setAsyncState({loading: false, status: "Posted thread reply"});
      }

      setComposerMode(undefined);
      setComposerValue("");
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setAsyncState({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function handleDelete(channelId: string, message: ChannelMessage) {
    setAsyncState((current) => ({...current, loading: true, error: undefined}));

    try {
      await service.deleteMessage(channelId, message);
      setAsyncState({loading: false, status: "Deleted message"});
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setAsyncState({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>
        slail {channel ? `#${channel.name}` : channelInput || "channel picker"}
      </Text>
      {viewMode === "picker" ? (
        <Box marginTop={1} height={pickerContainerHeight} flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
          <Text bold>Channels</Text>
          {availableChannels.length === 0 ? (
            <Text color="gray">No channels available</Text>
          ) : (
            visiblePickerChannels.map((item, index) => {
              const actualIndex = visiblePickerStartIndex + index;
              return (
                <Text key={item.id} color={actualIndex === channelSelectionIndex ? "cyan" : undefined}>
                  {actualIndex === channelSelectionIndex ? ">" : " "} #{item.name}
                </Text>
              );
            })
          )}
          {availableChannels.length > visiblePickerChannels.length ? (
            <Text color="gray">
              Channels {visiblePickerStartIndex + 1}-{visiblePickerStartIndex + visiblePickerChannels.length} of {availableChannels.length}
            </Text>
          ) : null}
          <Box marginTop={1}>
            <Text color="gray">Keys: ↑/↓, Enter, q</Text>
          </Box>
        </Box>
      ) : (
        <Box marginTop={1} height={layout.messageAreaHeight} flexDirection={layout.containerDirection}>
          <Box
            flexDirection="column"
            width={layout.channelWidth}
            height={layout.channelHeight}
            borderStyle="round"
            borderColor={paneFocus === "channel" ? "cyan" : "gray"}
            paddingX={1}
          >
            <Text bold color={paneFocus === "channel" ? "cyan" : undefined}>
              Channel
            </Text>
            {messages.length === 0 ? (
              <Text color="gray">No messages</Text>
            ) : (
              visibleChannelMessages.map((message, index) => {
                const actualIndex = visibleChannelStartIndex + index;
                const selected = actualIndex === selectedIndex;
                const rowText = `${selected ? ">" : " "} ${message.createdAt} ${message.author.label}: ${message.preview}${
                  message.replyCount > 0 ? ` (${message.replyCount} replies)` : ""
                }`;
                return (
                  <Text key={message.ts} color={selected ? "cyan" : undefined}>
                    {truncateLine(rowText, paneContentWidth)}
                  </Text>
                );
              })
            )}
          </Box>
          <Box
            flexDirection="column"
            width={layout.threadWidth}
            height={layout.threadHeight}
            borderStyle="round"
            borderColor={paneFocus === "thread" ? "magenta" : "gray"}
            paddingX={1}
            marginLeft={layout.paneGapMarginLeft}
            marginTop={layout.paneGapMarginTop}
          >
            <Text bold color={paneFocus === "thread" ? "magenta" : undefined}>
              Thread
            </Text>
            {!selectedMessage ? (
              <Text color="gray">Select a message</Text>
            ) : (
              <Box flexDirection="column">
                {visibleThreadLines.length === 0 ? (
                  <Text color="gray">No thread content</Text>
                ) : (
                  visibleThreadLines.map((line, index) => (
                    <Text
                      key={`${selectedMessage.ts}-${threadScrollOffset + index}`}
                      color={line === "" ? undefined : /^\w{3} \d{2},/.test(line) ? "yellow" : undefined}
                    >
                      {line}
                    </Text>
                  ))
                )}
                {threadHasReplySummary ? (
                  <Text color="gray">
                    Lines {threadScrollOffset + 1}-{Math.min(threadScrollOffset + threadContentLineBudget, threadDocumentLines.length)} of{" "}
                    {threadDocumentLines.length}
                  </Text>
                ) : null}
              </Box>
            )}
          </Box>
        </Box>
      )}
      <Box marginTop={1} flexDirection="column">
        {composerMode && viewMode === "messages" ? (
          <>
            <Text>
              {composerMode === "new" ? "New message" : "Reply"} (Enter to send, Esc to cancel)
            </Text>
            <TextInput value={composerValue} onChange={setComposerValue} onSubmit={handleSubmit} />
          </>
        ) : viewMode === "messages" ? (
          <Text color="gray">{layout.footerLegend}</Text>
        ) : null}
        {footer}
      </Box>
    </Box>
  );
}
