import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

type LLMProvider = "anthropic" | "openai";

function getProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase();
  if (provider === "openai") return "openai";
  return "anthropic";
}

async function generateWithAnthropic(prompt: string): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Anthropic API");
  }

  return block.text;
}

async function generateWithOpenAI(prompt: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI API");
  }

  return content;
}

export async function generateCompletion(prompt: string): Promise<string> {
  const provider = getProvider();

  if (provider === "openai") {
    return generateWithOpenAI(prompt);
  }

  return generateWithAnthropic(prompt);
}
