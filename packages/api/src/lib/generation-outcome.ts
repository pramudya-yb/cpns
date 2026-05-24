export function isNonRetryableProviderError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (/openai-compatible api error 5\d\d/i.test(message)) return true;
  if (/api error 5\d\d/i.test(message)) return true;
  if (lower.includes("midstreamfallbackerror")) return true;
  if (lower.includes("apiconnectionerror")) return true;
  if (lower.includes("provider returned html")) return true;
  if (/\berror 502\b/.test(lower) || /\berror 503\b/.test(lower) || /\berror 504\b/.test(lower)) {
    return true;
  }

  return false;
}

export function resolveGenerationJobOutcome(input: {
  requestedCount: number;
  generatedCount: number;
  failedSections?: string[];
}): {
  status: "completed" | "completed_partial" | "failed";
  progressMessage: string;
  errorMessage: string | null;
} {
  const failedSections = [...new Set(input.failedSections ?? [])];
  const sectionHint =
    failedSections.length > 0 ? ` Section gagal: ${failedSections.join(", ")}.` : "";

  if (input.generatedCount <= 0) {
    return {
      status: "failed",
      progressMessage: "Generation failed",
      errorMessage: `Tidak ada soal yang berhasil dibuat.${sectionHint} Periksa model/API provider.`,
    };
  }

  if (input.generatedCount < input.requestedCount) {
    return {
      status: "completed_partial",
      progressMessage: `Selesai sebagian: ${input.generatedCount}/${input.requestedCount} soal`,
      errorMessage: `Hanya ${input.generatedCount} dari ${input.requestedCount} soal berhasil dibuat.${sectionHint}`,
    };
  }

  return {
    status: "completed",
    progressMessage: "Completed",
    errorMessage: null,
  };
}

export function sectionsWithNoQuestions(
  sectionSplits: Array<{ section: string; count: number }>,
  questions: Array<{ section: string }>,
): string[] {
  return sectionSplits
    .filter((split) => !questions.some((q) => q.section === split.section))
    .map((split) => split.section);
}
