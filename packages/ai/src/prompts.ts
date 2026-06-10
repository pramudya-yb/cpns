import type { GenerationInput } from "./schemas";
import { getQuestionJsonSchemaDescription } from "./schema-to-prompt";
import { buildContentLanguageRules, buildExplanationLanguageRule } from "./language-rules";

export const OPTION_QUALITY_RULES = `- Each option "text" must be meaningful content derived from the passage or question — NEVER use generic labels like "Option A", "Option B", "Pilihan A", "Choice B", or "Placeholder".
- For multiple choice: always provide at least 4 real answer choices labeled A, B, C, D with plausible distractors.`;

export function buildQuickModePrompt(input: GenerationInput): string {
  const { examType, section, formats, difficulty, topics, questionCount } = input;

  const questionSchemaJson = getQuestionJsonSchemaDescription();

  return `You are an expert exam question writer for CPNS (Seleksi Calon Pegawai Negeri Sipil) specifically for the ${section} section.

Generate ${questionCount} authentic, high-quality questions for CPNS.

EXAM: CPNS
SECTION: ${section}
DIFFICULTY: ${difficulty}/5
TOPICS: ${topics.join(", ")}
FORMATS TO GENERATE: ${formats.join(", ")}

CONTEXT FOR SECTIONS:
- TWK (Tes Wawasan Kebangsaan): Fokus pada Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, Nasionalisme, Integritas, Bela Negara, Pilar Negara, dan Bahasa Indonesia.
- TIU (Tes Intelegensia Umum): Fokus pada Verbal (Analogi, Silogisme, Analitis), Numerik (Deret Angka, Perbandingan Kuantitatif, Soal Cerita), dan Figural.
- TKP (Tes Karakteristik Pribadi): Fokus pada Pelayanan Publik, Jejaring Kerja, Sosial Budaya, TIK, Profesionalisme, dan Anti Radikalisme.
- Teknis (SKB Teknis Umum): Soal teknis sesuai jabatan yang dilamar.
- Pertanahan_Dasar / Pertanahan & Agraria: Hukum Agraria (UUPA No. 5/1960), jenis-jenis hak atas tanah (HM, HGU, HGB, HP, HPL), konversi hak, tanah negara, tanah adat, reforma agraria, regulasi BPN/ATR.
- Pengukuran_Kadastral / Pengukuran & Pemetaan Kadastral: Ilmu ukur tanah, pengukuran batas bidang, peta kadastral, sistem koordinat TM3, GPS/GNSS, drone, fotogrametri, Kadaster, KKP, BHUMI, Peta ZNT.
- Pendaftaran_Tanah / Pendaftaran Tanah & Sertipikat: PP No. 24/1997, PTSL, buku tanah, surat ukur, sertipikat, pemeliharaan data, balik nama, pemecahan/penggabungan, sertipikat elektronik, hak tanggungan.
- Pengadaan_Tanah / Pengadaan Tanah & Ganti Rugi: UU No. 2/2012, Perpres No. 71/2012, tahapan pengadaan, penetapan lokasi, inventarisasi, penilaian ganti rugi, musyawarah, konsignasi, PSN.
- Pengendalian_Pertanahan / Pengendalian & Penertiban Tanah: Tanah terlantar (PP No. 20/2021), penertiban absentee, monitoring penggunaan tanah, alih fungsi lahan, sengketa-konflik-perkara pertanahan, mediasi.
- Penilaian_Tanah / Penilaian Tanah & Properti: Zona Nilai Tanah (ZNT), NIR, metode penilaian tanah (perbandingan pasar/biaya/pendapatan), penilai publik, NJOP, faktor nilai tanah.

INSTRUCTIONS:
${buildContentLanguageRules(examType)}
${buildExplanationLanguageRule(examType)}
- Passage length should be appropriate for the difficulty.
- Each question must have:
  * a reading passage or context (passageText) — Wajib Bahasa Indonesia
   * a clear question prompt (questionText) — Wajib Bahasa Indonesia
   * a correct answer (correctAnswer)
   * a detailed explanation (explanation) — Wajib Bahasa Indonesia
  * difficulty level (${difficulty})
  * relevant skill tags (skillTags)
- For multiple choice: always provide 5 options labeled A, B, C, D, E (standard for CPNS).
- Options must be plausible distractors — one clearly correct answer.
${OPTION_QUALITY_RULES}
- For matching_pairs: Provide options as an array of {key, text} where key is the left item identifier and text is the left item. correctAnswer should be a serialized mapping like "A:1,B:2,C:3" matching each left key to its right pair.
- For error_recognition: options are error segments (A, B, C, D, E) and correctAnswer is the key of the segment containing an error.
- For text_insertion: options are position markers (A, B, C, D, E) within the passage where a sentence could be inserted.
- For sentence_arrangement: Provide options as shuffled fragments in random order. correctAnswer is the correct order as comma-separated keys (e.g. "D,A,C,B").

OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure (no markdown code blocks, no extra text):

{
  "questions": [
    // array of question objects. Schema:
${questionSchemaJson.split("\n").map((l) => "    " + l).join("\n")}
  ]
}

You may reuse the same passage for multiple questions, or generate a new passage per question.
`;
}
