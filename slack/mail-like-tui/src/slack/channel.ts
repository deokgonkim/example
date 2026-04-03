const CHANNEL_ID_PATTERN = /^[CGD][A-Z0-9]{8,}$/;

export function normalizeChannelInput(input: string): string {
  return input.trim().replace(/^#/, "");
}

export function looksLikeChannelId(input: string): boolean {
  return CHANNEL_ID_PATTERN.test(normalizeChannelInput(input));
}
