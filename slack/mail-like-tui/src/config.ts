export type AppConfig = {
  userToken: string;
  botToken?: string;
};

export function loadDotEnv(path = ".env"): void {
  try {
    process.loadEnvFile(path);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw error;
    }
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const userToken = env.SLACK_USER_TOKEN?.trim();
  const botToken = env.SLACK_BOT_TOKEN?.trim();

  if (!userToken) {
    throw new Error("Missing SLACK_USER_TOKEN");
  }

  return {
    userToken,
    botToken: botToken || undefined,
  };
}
