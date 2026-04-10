import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const MODEL = {
  fast: "claude-haiku-4-5-20251001",
  deep: "claude-sonnet-4-6",
} as const;
