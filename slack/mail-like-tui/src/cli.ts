export type CliOptions = {
  channelInput?: string;
};

export function parseCliArgs(argv: string[]): CliOptions {
  const [, , channelInput] = argv;

  return {channelInput};
}
