interface QuestionLanguageFields {
  questionText: string;
  options?: Array<{ key: string; text: string }>;
}

/** Target language for exam content (passage, question, options). */
export function getTargetLanguage(_examType: string): string {
  return "Bahasa Indonesia";
}

const INDONESIAN_PROSE_MARKERS =
  /\b(yang|dari|pada|Apakah|Menurut|paragraf|bacaan|teks|judul|penulis|artikel|soal|pilihan|jawaban|berikut|manakah|bagian|kalimat|isinya|topik|gagasan|benar|karena|merujuk|sesuai|artinya|makna|kata|terdapat|disebutkan|dijelaskan|adalah|jadi|oleh|opsi|pilihan|jawabannya|penjelasan|Pancasila|UUD|NKRI|Bhinneka|Nasionalisme|Integritas|Negara|TIU|TWK|TKP)\b/i;

/** Strip foreign characters (heuristics) if needed, but for CPNS we mostly deal with Latin script. */
export function stripExamScriptForAnalysis(text: string): string {
  return text.trim();
}

/** Latin prose looks like Bahasa Indonesia. */
export function hasIndonesianProse(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (INDONESIAN_PROSE_MARKERS.test(t)) return true;
  return t.length >= 15;
}

export function buildContentLanguageRules(_examType: string): string {
  return `- LANGUAGE RULE (critical):
  * passageText, questionText, and every option "text" MUST be written in Bahasa Indonesia — the authentic exam language for CPNS.
  * explanation: tulis dalam Bahasa Indonesia yang mendalam dan mudah dimengerti.`;
}

export function buildExplanationLanguageRule(_examType?: string): string {
  return `- explanation — WAJIB ditulis dalam Bahasa Indonesia sebagai penjelasan utama.`;
}

export function getQuestionLanguageErrors(
  q: QuestionLanguageFields,
  _examType: string,
): string[] {
  const errors: string[] = [];
  if (!hasIndonesianProse(q.questionText)) {
    errors.push("questionText must be in Bahasa Indonesia");
  }
  for (const opt of q.options ?? []) {
    if (!hasIndonesianProse(opt.text) && opt.text.length > 5) {
      errors.push(`option ${opt.key} must be in Bahasa Indonesia`);
    }
  }
  return errors;
}

export function getExplanationLanguageErrors(explanation: string): string[] {
  const t = explanation.trim();
  if (!t) return [];

  const latinPart = stripExamScriptForAnalysis(t);

  if (latinPart.length === 0) {
    return ["explanation must include Bahasa Indonesia prose, not only foreign script"];
  }

  if (!hasIndonesianProse(latinPart)) {
    return ["explanation prose must be in Bahasa Indonesia"];
  }

  return [];
}
