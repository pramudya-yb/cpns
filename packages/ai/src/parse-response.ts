/**
 * Normalize model output before JSON parsing.
 * Reasoning models (GLM, DeepSeek, etc.) often wrap chain-of-thought in tags
 * that are NOT HTML error pages.
 */

const THINK_TAG = "think";

const REASONING_BLOCK_PATTERNS: RegExp[] = [
  /<think>[\s\S]*?<\/redacted_thinking>/gi,
  /<thinking>[\s\S]*?<\/thinking>/gi,
  new RegExp(`<${THINK_TAG}>[\\s\\S]*?</${THINK_TAG}>`, "gi"),
];

const UNCLOSED_REASONING_PREFIXES = [
  /^<think>[\s\S]*/i,
  /^<thinking>[\s\S]*/i,
  new RegExp(`^<${THINK_TAG}>[\\s\\S]*`, "i"),
];

export function stripReasoningBlocks(content: string): string {
  let text = content;
  for (const pattern of REASONING_BLOCK_PATTERNS) {
    text = text.replace(pattern, "");
  }
  for (const pattern of UNCLOSED_REASONING_PREFIXES) {
    text = text.replace(pattern, "");
  }
  return text.trim();
}

function extractJsonCandidate(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const objIdx = trimmed.indexOf("{");
  const arrIdx = trimmed.indexOf("[");
  let start = -1;
  if (objIdx === -1) start = arrIdx;
  else if (arrIdx === -1) start = objIdx;
  else start = Math.min(objIdx, arrIdx);

  if (start < 0) return trimmed;

  const slice = trimmed.slice(start);
  const lastBrace = slice.lastIndexOf("}");
  const lastBracket = slice.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);
  if (end === -1) return slice;
  return slice.slice(0, end + 1);
}

export function parseAiJsonResponse(content: string): unknown {
  const normalized = stripReasoningBlocks(content);
  if (!normalized) throw new Error("Empty response from AI");

  const candidates = [normalized, extractJsonCandidate(normalized)];
  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];

  let lastError: Error | undefined;
  for (const candidate of uniqueCandidates) {
    try {
      return JSON.parse(candidate);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const markdownCleaned = candidate
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
      if (markdownCleaned !== candidate) {
        try {
          return JSON.parse(markdownCleaned);
        } catch (inner: unknown) {
          lastError = inner instanceof Error ? inner : new Error(String(inner));
        }
      }
    }
  }

  throw new Error(
    `Failed to parse AI response as JSON: ${lastError?.message ?? "unknown error"}. Preview: ${normalized.slice(0, 200)}`,
  );
}

export function extractContentFromCompletionBody(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const json = JSON.parse(trimmed) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : null;
  } catch {
    return null;
  }
}

export function looksLikeHtmlErrorPage(content: string): boolean {
  const head = content.trim().slice(0, 300).toLowerCase();
  return (
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.startsWith("<head") ||
    head.startsWith("<body") ||
    /^<\?(xml|php)/.test(head)
  );
}
