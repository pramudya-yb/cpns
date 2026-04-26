import { OpenAICompatibleClient } from "./client";
import { buildQuickModePrompt } from "./prompts";
import {
  questionSchema,
  type GenerationInput,
  type GenerationResult,
} from "./schemas";

export async function generateQuestionsQuick(
  input: GenerationInput,
): Promise<GenerationResult> {
  const start = Date.now();
  const client = new OpenAICompatibleClient(
    input.apiKeyConfig.baseUrl,
    input.apiKeyConfig.apiKey,
  );

  const prompt = buildQuickModePrompt(input);

  const response = await client.chatCompletion({
    model: input.apiKeyConfig.model,
    messages: [
      {
        role: "system",
        content:
          "You are a precise exam question generator. You always return valid JSON. You never include markdown formatting around the JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message.content;
  if (!content) {
    throw new Error("Empty response from AI");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Sometimes LLM wraps in markdown — strip it
    const cleaned = content
      .replace(/^```json\s*/, "")
      .replace(/```\s*$/, "")
      .trim();
    parsed = JSON.parse(cleaned);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON response from AI");
  }

  const raw = parsed as Record<string, unknown>;
  if (!Array.isArray(raw.questions)) {
    throw new Error("Missing 'questions' array in AI response");
  }

  const questions = raw.questions
    .map((q: unknown) => {
      try {
        return questionSchema.parse(q);
      } catch (e) {
        console.warn("Question validation failed:", e);
        return null;
      }
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);

  if (questions.length === 0) {
    throw new Error("No valid questions generated");
  }

  return {
    questions,
    meta: {
      model: input.apiKeyConfig.model,
      tokensUsed: response.usage?.total_tokens,
      durationMs: Date.now() - start,
      mode: "quick",
    },
  };
}
