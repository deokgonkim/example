#!/usr/bin/env node
import React from "react";
import {render} from "ink";

import {parseCliArgs} from "./cli.js";
import {loadConfig, loadDotEnv} from "./config.js";
import {SlackService} from "./slack/service.js";
import {App} from "./ui/App.js";

async function main() {
  loadDotEnv();
  const cli = parseCliArgs(process.argv);
  const config = loadConfig();
  const service = new SlackService(config);

  render(<App channelInput={cli.channelInput} service={service} />);
}

void main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`slail failed: ${message}`);
  process.exitCode = 1;
});
