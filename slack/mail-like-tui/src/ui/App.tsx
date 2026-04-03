import React, {useEffect, useMemo, useState} from "react";
import {Box, Text, useApp, useInput} from "ink";
import TextInput from "ink-text-input";

import type {ChannelMessage, ChannelRef, ThreadMessage} from "../slack/types.js";
import {SlackService} from "../slack/service.js";

type ComposerMode = "new" | "reply";
type ViewMode = "picker" | "messages";
type PaneFocus = "channel" | "thread";

const THREAD_VIEWPORT_SIZE = 6;

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

export function getMaxThreadScrollOffset(replyCount: number, viewportSize = THREAD_VIEWPORT_SIZE): number {
  return Math.max(0, replyCount - viewportSize);
}

export function clampThreadScrollOffset(offset: number, replyCount: number, viewportSize = THREAD_VIEWPORT_SIZE): number {
  return Math.max(0, Math.min(offset, getMaxThreadScrollOffset(replyCount, viewportSize)));
}

export function getVisibleThreadWindow(
  replies: ThreadMessage[],
  offset: number,
  viewportSize = THREAD_VIEWPORT_SIZE,
): ThreadMessage[] {
  const start = clampThreadScrollOffset(offset, replies.length, viewportSize);
  return replies.slice(start, start + viewportSize);
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
  const threadReplies = useMemo(
    () => getVisibleThreadReplies(threadMessages, selectedMessage),
    [selectedMessage, threadMessages],
  );
  const visibleThreadReplies = useMemo(
    () => getVisibleThreadWindow(threadReplies, threadScrollOffset),
    [threadReplies, threadScrollOffset],
  );
  const maxThreadScrollOffset = useMemo(
    () => getMaxThreadScrollOffset(threadReplies.length),
    [threadReplies.length],
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
    setThreadScrollOffset((current) => clampThreadScrollOffset(current, threadReplies.length));
  }, [threadReplies.length]);

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
        <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
          <Text bold>Channels</Text>
          {availableChannels.length === 0 ? (
            <Text color="gray">No channels available</Text>
          ) : (
            availableChannels.map((item, index) => (
              <Text key={item.id} color={index === channelSelectionIndex ? "cyan" : undefined}>
                {index === channelSelectionIndex ? ">" : " "} #{item.name}
              </Text>
            ))
          )}
          <Box marginTop={1}>
            <Text color="gray">Keys: ↑/↓ move, Enter open, q quit</Text>
          </Box>
        </Box>
      ) : (
        <Box marginTop={1} height={20}>
          <Box
            flexDirection="column"
            width="50%"
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
              messages.map((message, index) => {
                const selected = index === selectedIndex;
                return (
                  <Text key={message.ts} color={selected ? "cyan" : undefined}>
                    {selected ? ">" : " "} {message.createdAt} {message.author.label}: {message.preview}
                    {message.replyCount > 0 ? ` (${message.replyCount} replies)` : ""}
                  </Text>
                );
              })
            )}
          </Box>
          <Box
            flexDirection="column"
            width="50%"
            borderStyle="round"
            borderColor={paneFocus === "thread" ? "magenta" : "gray"}
            paddingX={1}
            marginLeft={1}
          >
            <Text bold color={paneFocus === "thread" ? "magenta" : undefined}>
              Thread
            </Text>
            {!selectedMessage ? (
              <Text color="gray">Select a message</Text>
            ) : (
              <>
                <Text>
                  {selectedMessage.createdAt} {selectedMessage.author.label}
                </Text>
                <Text>{selectedMessage.text}</Text>
                <Box marginTop={1} flexDirection="column">
                  {threadReplies.length === 0 ? (
                    <Text color="gray">No replies</Text>
                  ) : (
                    visibleThreadReplies.map((message) => (
                      <Box key={message.ts} flexDirection="column" marginBottom={1}>
                        <Text color="yellow">
                          {message.createdAt} {message.author.label}
                        </Text>
                        <Text>{message.text}</Text>
                      </Box>
                    ))
                  )}
                </Box>
                {threadReplies.length > THREAD_VIEWPORT_SIZE ? (
                  <Text color="gray">
                    Replies {threadScrollOffset + 1}-{Math.min(threadScrollOffset + THREAD_VIEWPORT_SIZE, threadReplies.length)} of{" "}
                    {threadReplies.length}
                  </Text>
                ) : null}
              </>
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
          <Text color="gray">Keys: b channels, Tab switch pane, ↑/↓ act on focused pane, n new, r reply, d delete, R refresh, q quit</Text>
        ) : null}
        {footer}
      </Box>
    </Box>
  );
}
