import { describe, expect, it } from "bun:test";
import {
  extractContentFromCompletionBody,
  isLikelyTruncatedJson,
  parseAiJsonResponse,
  stripReasoningBlocks,
} from "../parse-response";

describe("stripReasoningBlocks", () => {
  it("removes closed redacted_thinking blocks", () => {
    const input = "<think>plan</think>\n{\"ok\":true}";
    expect(stripReasoningBlocks(input)).toBe('{"ok":true}');
  });

  it("removes think blocks", () => {
    const input = ["<", "think", ">planning</", "think", ">\n", '{"ok":true}'].join("");
    expect(stripReasoningBlocks(input)).toBe('{"ok":true}');
  });

  it("removes unclosed thinking at start", () => {
    const input = "<think>still streaming...";
    expect(stripReasoningBlocks(input)).toBe("");
  });

  it("does not treat XML-like tags in JSON as reasoning", () => {
    const input = '{"questionText":"<b>highlight</b>"}';
    expect(stripReasoningBlocks(input)).toBe(input);
  });
});

describe("parseAiJsonResponse", () => {
  it("parses JSON after reasoning preamble", () => {
    const parsed = parseAiJsonResponse(
      "<think>planning</think>\n```json\n{\"questions\":[]}\n```",
    );
    expect(parsed).toEqual({ questions: [] });
  });

  it("extracts JSON object embedded in prose", () => {
    const parsed = parseAiJsonResponse(
      "Here is the result:\n{\"questions\":[{\"format\":\"multiple_choice\"}]}\nThanks!",
    );
    expect(parsed).toEqual({ questions: [{ format: "multiple_choice" }] });
  });

  it("throws on empty content after stripping", () => {
    expect(() => parseAiJsonResponse("<think>only thinking")).toThrow(
      "Empty response from AI",
    );
  });

  it("detects truncated JSON and throws a clear truncation error", () => {
    const truncated =
      '{"title":"The Global Rise of Coffee Culture","passage":"Coffee has a rich history in the highl';
    expect(isLikelyTruncatedJson(truncated)).toBe(true);
    expect(() => parseAiJsonResponse(truncated)).toThrow("JSON response was truncated");
  });
});

describe("extractContentFromCompletionBody", () => {
  it("reads non-stream chat completion JSON", () => {
    const body = JSON.stringify({
      choices: [{ message: { content: '{"questions":[]}' } }],
    });
    expect(extractContentFromCompletionBody(body)).toBe('{"questions":[]}');
  });

  it("returns null for non-JSON bodies", () => {
    expect(extractContentFromCompletionBody("<html>error</html>")).toBeNull();
  });
});
