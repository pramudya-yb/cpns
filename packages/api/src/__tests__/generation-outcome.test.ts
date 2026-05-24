import { describe, expect, it } from "bun:test";
import {
  isNonRetryableProviderError,
  resolveGenerationJobOutcome,
  sectionsWithNoQuestions,
} from "../lib/generation-outcome";

describe("isNonRetryableProviderError", () => {
  it("detects OpenAI-compatible 500 errors", () => {
    expect(
      isNonRetryableProviderError(
        new Error('OpenAI-compatible API error 500: {"error":{"message":"litellm.MidStreamFallbackError"}}'),
      ),
    ).toBe(true);
  });

  it("detects LiteLLM connection errors", () => {
    expect(isNonRetryableProviderError(new Error("litellm.APIConnectionError: upstream failed"))).toBe(
      true,
    );
  });

  it("returns false for JSON parse failures", () => {
    expect(isNonRetryableProviderError(new Error("Failed to parse AI response as JSON"))).toBe(false);
  });
});

describe("resolveGenerationJobOutcome", () => {
  it("marks full success as completed", () => {
    expect(
      resolveGenerationJobOutcome({ requestedCount: 20, generatedCount: 20 }),
    ).toEqual({
      status: "completed",
      progressMessage: "Completed",
      errorMessage: null,
    });
  });

  it("marks partial success as completed_partial", () => {
    const outcome = resolveGenerationJobOutcome({
      requestedCount: 20,
      generatedCount: 4,
      failedSections: ["WRITING"],
    });
    expect(outcome.status).toBe("completed_partial");
    expect(outcome.errorMessage).toContain("4 dari 20");
    expect(outcome.errorMessage).toContain("WRITING");
  });

  it("marks zero questions as failed", () => {
    const outcome = resolveGenerationJobOutcome({
      requestedCount: 20,
      generatedCount: 0,
      failedSections: ["READING", "WRITING"],
    });
    expect(outcome.status).toBe("failed");
    expect(outcome.errorMessage).toContain("Tidak ada soal");
  });
});

describe("sectionsWithNoQuestions", () => {
  it("returns sections missing from generated questions", () => {
    expect(
      sectionsWithNoQuestions(
        [
          { section: "READING", count: 10 },
          { section: "WRITING", count: 10 },
        ],
        [{ section: "READING" }, { section: "READING" }],
      ),
    ).toEqual(["WRITING"]);
  });
});
